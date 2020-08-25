let isDebug = true;

// Listen for messages from the content
chrome.runtime.onMessage.addListener((msg, sender, response) => {
    consoleLog("Background script received message from: " + msg.from + ", with subject: " + msg.subject);
    // First, validate the message's structure.
    if ((msg.from === 'content') && (msg.subject === 'recognizeStarted')) {
        toggleButton('icon_19_on.png');
    }
    if ((msg.from === 'content') && (msg.subject === 'recognizeStopped')) {
        toggleButton('icon_19_off.png');
    }
});

function toggleButton( iconPath ){
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        chrome.browserAction.setIcon({tabId: tabs[0].id, path: iconPath});
        consoleLog('Icon changed to ' + iconPath);
    });
}

function timeStamp() {
    let d = new Date();
    return d.toLocaleTimeString();
}

function consoleLog(text) {
    if ( isDebug )  {
        console.log(timeStamp() + ' ' + text);
    }
}