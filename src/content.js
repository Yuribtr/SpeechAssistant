let context = null;
let vMeterWorkletNode = null;
let inputs, index, activeInput, buffer;
let isDebug = true;
let isStopped = true;
let isStopRequested = false;
let isStartRequested = false;
let lastError = null;
let recognitionLang = null;
// if quality will be lower than recognitionConfLimit - warning will be displayed
let recognitionConfLimit = 0.8;
let informerPopup = document.createElement("div");
let informerPopupText = document.createElement("span");
let informerPopupMessage = document.createElement("span");
let informerPopupConfidence = document.createElement("span");

informerPopup.className = "saInformerPopup";
informerPopupText.className = "saInformerPopupText";
informerPopupMessage.className = "saInformerPopupMessage";
informerPopupConfidence.className = "saInformerPopupConfidence";

informerPopup.appendChild(informerPopupText);
informerPopupText.appendChild(informerPopupMessage);
informerPopupText.appendChild(informerPopupConfidence);
let messageInAir = chrome.i18n.getMessage("microphoneOn");
let messageLowConfidence = chrome.i18n.getMessage("lowQuality");
// register new instance of speech recognition depending from which browser we use
let recognition = new webkitSpeechRecognition() || new SpeechRecognition();
let errorCodes = {
    "no-speech": chrome.i18n.getMessage("errNoSpeech"),
    "aborted": chrome.i18n.getMessage("errAborted"),
    "audio-capture": chrome.i18n.getMessage("errAudioCapture"),
    "network": chrome.i18n.getMessage("errNetwork"),
    "not-allowed": chrome.i18n.getMessage("errNotAllowed"),
    "service-not-allowed": chrome.i18n.getMessage("errServiceNotAllowed"),
    "bad-grammar": chrome.i18n.getMessage("errBadGrammar"),
    "language-not-supported": chrome.i18n.getMessage("errLanguageNotSupported")
};
let backColor = "DarkOrchid";
let backErrorColor = "Crimson";
let lastEventTime = 0;
let currEventTime = 0;
let isEnabled = 0;
//detecting current domain name
let host = window.location.host;
consoleLog("Extension loaded at " + host);

//reading settings
chrome.storage.sync.get([
    "favoriteColor",
    "recognitionLang",
    host
], function (items) {
    if (typeof items.favoriteColor === "undefined") {
        items.favoriteColor = "DarkOrchid";
    }
    backColor = items.favoriteColor;
    //if lang not specified, assume this will be default browser language
    if (typeof items.recognitionLang === "undefined") {
        consoleLog("Storage: not found any recognitionLang");
        //check, if default browser language is in list of supported SpeechRecognition languages
        let tmpLang = window.navigator.language || window.navigator.userLanguage;
        if (checkEncodingSupport(tmpLang)) {
            consoleLog("Storage: browser language " + tmpLang + " is supported!");
            items.recognitionLang = tmpLang;
        } else {
            //if not, fallback to english GB lang
            consoleLog("Storage: browser language " + tmpLang + " is not supported! Falling back to 'en-GB'");
            items.recognitionLang = "en-GB";
        }
    }
    recognitionLang = items.recognitionLang;
    isEnabled = items[host] === 1 ? 1 : 0;
    consoleLog("Storage: set recognitionLang: " + recognitionLang);
    consoleLog("Storage: set favoriteColor: " + backColor);
    consoleLog("Storage: set isEnabled: " + isEnabled);
    //because this callback is asynchronous, we have to start recognizing upon receipt of settings
    if (isEnabled) start();
});

// Listen for messages from the popup.
chrome.runtime.onMessage.addListener((msg, sender, response) => {
    consoleLog("Received message from: " + msg.from + ", with subject: " + msg.subject);
    // First, validate the message"s structure.
    if ((msg.from === "popup") && (msg.subject === "startRecognize")) {
        isEnabled = true;
        start();
    }
    if ((msg.from === "popup") && (msg.subject === "stopRecognize")) {
        isEnabled = false;
        stop();
    }
});

function checkEncodingSupport(encoding) {
    let result = false;
    //langsList is declared in langlist.js, which run before, due to conditions in manifest
    for (let i = 0; i < langsList.length; i++) {
        if (searchEncodingInList(encoding, langsList[i]) >= 0) {
            return true;
        }
    }
    return result;
}

function searchEncodingInList(encoding, encList) {
    let result = -1;
    //start to iterate from second element, as first contains only country name
    for (let i = 1; i < encList.length; i++) {
        if (encList[i][0] === encoding) {
            //but return index -1 for usage in dropdown list
            result = i - 1;
        }
    }
    return result;
}

function sendMessageToBackground(text) {
    chrome.runtime.sendMessage({
        from: "content",
        subject: text
    });
}

function start() {
    consoleLog("Monitoring started...");
    //changing icon at Chrome panel
    sendMessageToBackground("recognizeStarted");
    informerPopupConfidence.innerText = messageLowConfidence;
    //setting language (if specified in plugin settings), otherwise use default language from browser if supported, or use default
    if (recognitionLang !== null) recognition.lang = recognitionLang;
    //force SpeechRecognition engine NOT to stop after each phrase detection
    recognition.continuous = true;
    //receive only final result, without intermediate results which are commonly are not correct
    recognition.interimResults = false;
    //receive only one variant of recognition
    recognition.maxAlternatives = 1;
    recognition.onresult = function (event) {
        consoleLog("onresult fired");
        //divide into words detected results & get the latest
        //total results detected
        let resultsLength = event.results.length - 1;
        //get length of latest results
        let ArrayLength = event.results[resultsLength].length - 1;
        //get last word detected
        let saidWord = event.results[resultsLength][ArrayLength].transcript;
        //get rounded coefficient of reliability or accuracy (1 is max)
        let resultConfidence = Math.round(event.results[resultsLength][ArrayLength].confidence * 100) / 100;
        if (window.activeInput !== null) {
            buffer = buffer + " " + saidWord;
            if (isDebug)
                buffer = buffer + " [" + resultConfidence + "]";
            window.activeInput.value = window.activeInput.value + buffer;
            buffer = "";
            if (resultConfidence < recognitionConfLimit) {
                consoleLog("Low quality detection!" + " [" + resultConfidence + "]");
                showConfidenceWarning(true);
            } else {
                showConfidenceWarning(false);
            }
        }
    };

    recognition.onstart = function () {
        isStopped = false;
        lastError = null;
        informerPopupMessage.innerText = messageInAir;
        informerPopupText.style.background = backColor;
        informerPopupConfidence.style.background = backErrorColor;
        isStopRequested = isStartRequested = false;
        consoleLog("Speech recognition service has started");
    };

    recognition.onerror = function (event) {
        lastError = event.error;
        let myMessage = event.message === null ? event.message : errorCodes[event.error];
        //if new error codes without messages will be added in future in browser, at least we will show those error codes
        informerPopupMessage.innerText = typeof myMessage === "undefined" ? event.error : myMessage;
        consoleLog("Error: " + myMessage + " (" + event.error + ")");
    };

    recognition.onend = function () {
        consoleLog("Speech recognition service disconnected");
        isStopped = true;
        isStopRequested = false;
        //restart if we move from another input, or if service disconnected due to silence
        if (((isStartRequested) || (window.activeInput !== null)) && ((lastError === null) || (lastError === "no-speech"))) {
            buffer = "";
            context.resume();
            recognition.start();
        }
        if ((lastError !== null) && (lastError !== "no-speech")) {
            informerPopupText.style.background = backErrorColor;
        }
    };

    recognition.onspeechend = function () {
        consoleLog("Speech has stopped being detected");
    };

    recognition.onsoundend = function (event) {
        consoleLog("Sound has stopped being received");
    };

    //Extension loaded after DOM ready, so we can iterate all inputs
    inputs = document.querySelectorAll("input[type=text], input[type=password], input[type=email], input[type=search], input[type=url], input[type=tel], textarea");
    for (index = 0; index < inputs.length; ++index) {
        inputs[index].onfocus = function () {
            consoleLog("onFocus fired " + this);
            //move input focus to selected component
            window.activeInput = this;
            //check if there enough space above focused element to show our popup
            consoleLog("Focused element at " + getOffset(this).top);
            if (getOffset(this).top > 100) {
                insertBefore(informerPopup, this);
                informerPopupText.classList.remove("bottom");
            } else {
                insertAfter(informerPopup, this);

                informerPopupText.classList.add("bottom");
                //consoleLog("Setting offset from focused element to "+this.offsetHeight+" + 10px");
                informerPopupText.style.top = this.offsetHeight + 5 + "px";
                informerPopupText.style.left = "-" + this.offsetWidth + "px";
            }
            informerPopupText.classList.add("show");
            //normal condition
            if (!isStartRequested && isStopped) {
                //isStopped = false;
                isStartRequested = true;
                isStopRequested = false;
                buffer = "";
                //context.resume();
                startVMeter();
                recognition.start();
            }
            //if we moves from another input, let"s schedule new start
            if (isStopRequested && !isStopped) {
                isStartRequested = true;
            }
        };
        inputs[index].onblur = function () {
            consoleLog("onBlur fired " + this);
            informerPopupText.classList.remove("show");
            //do stop, if input focus was NOT moved to other component, otherwise ignore this event
            if (window.activeInput === this) {
                isStartRequested = false;
                isStopRequested = true;
                window.activeInput = null;
                stopVMeter();
                recognition.stop();
            }
        }
    }
}

function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };
}

function stop() {
    if ((typeof window.activeInput !== "undefined") && (window.activeInput !== null)) {
        window.activeInput.blur();
    }
    //Extension loaded after DOM ready, so we can iterate all inputs
    inputs = document.querySelectorAll("input[type=text], input[type=password], input[type=email], input[type=search], input[type=url], input[type=tel], textarea");
    for (index = 0; index < inputs.length; ++index) {
        //discarding all events
        inputs[index].onfocus = null;
        inputs[index].onblur = null;
    }
    //changing icon at Chrome panel
    sendMessageToBackground("recognizeStopped");
    consoleLog("Monitoring stopped!");
}

function showConfidenceWarning(visible) {
    if (visible) {
        consoleLog("Showing confidence warning");
        informerPopupConfidence.classList.add("show");
    } else {
        consoleLog("Hiding confidence warning");
        informerPopupConfidence.classList.remove("show");
    }
}

function insertAfter(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}

function insertBefore(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode);
}

function timeStamp() {
    let d = new Date();
    return d.toLocaleTimeString();
}

function consoleLog(text) {
    if (isDebug) {
        currEventTime = Date.now();
        let flags = " [" + (currEventTime - lastEventTime) + "ms";
        if (isStopped) flags = flags + " isStopped";
        if (isStopRequested) flags = flags + " isStopRequested";
        if (isStartRequested) flags = flags + " isStartRequested";
        flags = flags + "]";
        console.log(timeStamp() + " " + text + flags);
        lastEventTime = currEventTime;
    }
}

//AudioWorkletNode needed for creation and async communication with AudioWorkletProcessor
class VMeterWorkletNode extends AudioWorkletNode {
    constructor(context) {
        super(context, "vmonitor-processor");
        this.port.onmessage = this.handleMessage.bind(this);
    }

    handleMessage(event) {
        consoleLog("AudioWorkletNode received message: " + event.data.message);
    }

    doStop() {
        this.port.postMessage({
            message: "stopMonitoring"
        });
    }
}

async function startVMeter() {
    consoleLog("VMeter starting");
    const processorURL = chrome.runtime.getURL("vmeter.js");
    //todo: check if we need to recreate AudioContext
    if (!context) {
        context = new AudioContext();
    }
    await context.audioWorklet.addModule(processorURL);
    consoleLog("VMeter module added");
    vMeterWorkletNode = new VMeterWorkletNode(context);
    vMeterWorkletNode.connect(context.destination);
    const streamFromUserMedia = await navigator.mediaDevices.getUserMedia({audio: true});
    context.createMediaStreamSource(streamFromUserMedia).connect(vMeterWorkletNode);
}

async function stopVMeter() {
    consoleLog("VMeter stopping");
    if (vMeterWorkletNode !== null) {
        await vMeterWorkletNode.doStop();
        //todo: check if we need to assign null for destroy
        vMeterWorkletNode = null;
    }
}