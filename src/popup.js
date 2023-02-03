let isDebug = true;
let switchBtn = document.getElementById("switchSA");
switchBtn.addEventListener("click", toggleDetection);
let isEnabled = 0;
//detecting current domain name
let host = null;
chrome.tabs.query({"active": true, "lastFocusedWindow": true}, function (tabs) {
    let url = new URL(tabs[0].url);
    window.host = url.host;
    //because this callback is asynchronous, we proceed upon receipt of settings
    restore_options();
});

function restore_options() {
    //console.log("reading " + window.host);
    chrome.storage.sync.get([
        window.host,
        "recognitionLang"
    ], function (items) {
        //console.log("callback for " + window.host + " with value " + items[window.host]);
        isEnabled = items[window.host] === 1 ? 1 : 0;
        //console.log("found " + items[window.host]);
        switchBtn.checked = isEnabled;
        //console.log("isEnabled " + isEnabled);
        document.getElementById("speechAssistantOptions").innerHTML = chrome.i18n.getMessage("speechAssistantOptions");
        document.getElementById("speechAssistantForSiteTitle").innerHTML = chrome.i18n.getMessage("speechAssistantForSiteTitle") + ":";
        document.getElementById("speechAssistantForSite").innerHTML = chrome.i18n.getMessage("speechAssistantForSite") + ":";
        document.getElementById("speechAssistantForSiteLangTitle").innerHTML = chrome.i18n.getMessage("speechAssistantForSiteLangTitle") + ":";
        document.getElementById("speechAssistantForSiteName").innerHTML = window.host;
        document.getElementById("speechAssistantForSiteLang").addEventListener("click", openOptions);

        if (typeof items.recognitionLang === "undefined") {
            //check, if default browser language is in list of supported SpeechRecognition languages
            let tmpLang = getLangName(window.navigator.language || window.navigator.userLanguage);
            if (tmpLang !== "") {
                items.recognitionLang = tmpLang;
            } else {
                //if not, fallback to english GB lang
                items.recognitionLang = getLangName("en-GB");
            }
        } else {
            items.recognitionLang = getLangName(items.recognitionLang);
        }

        document.getElementById("speechAssistantForSiteLang").innerHTML = items.recognitionLang;
        document.getElementById("switchStatus").innerHTML = chrome.i18n.getMessage(isEnabled ? "enabled" : "disabled");
    });
}

function getLangName(encoding) {
    let result = "";
    //langList is declared in langlist.js, which run before, due to conditions in popup.html
    for (let i = 0; i < langsList.length; i++) {
        result = getLangNameFromList(encoding, langsList[i]);
        if (result !== "") {
            return result;
        }
    }
    return result;
}

function getLangNameFromList(encoding, encList) {
    let result = "";
    for (let i = 1; i < encList.length; i++) {
        if (encList[i][0] === encoding) {
            if (i === 1) {
                //if there no dialects, return country name
                result = encList[0];
            } else {
                //otherwise, return dialect name
                result = encList[0] + " [" + encList[i][1] + "]";
            }
            return result;
        }
    }
    return result;
}

function toggleDetection() {
    //inversing state of site detection
    isEnabled = isEnabled === 1 ? 0 : 1;
    save_options(window.host, isEnabled);
    //try to start/stop recognizing on main page
    if (isEnabled) {
        consoleLog("Popup sending START command");
        sendMessageToContent("startRecognize");
    } else {
        consoleLog("Popup sending STOP command");
        sendMessageToContent("stopRecognize");
    }
}

function sendMessageToContent(text) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            from: "popup",
            subject: text
        });
    });
}

function save_options(host, isEnabled) {
    //in order to decrease amount om consumed memory storage, storing only one digit
    chrome.storage.sync.set({
        [host]: isEnabled
    }, function () {
        restore_options();
    });
}

function consoleLog(text) {
    if (isDebug) {
        console.log(text);
    }
}

function openOptions() {
    chrome.runtime.openOptionsPage();
}