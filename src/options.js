function save_options() {
    chrome.storage.sync.set({
        favoriteColor: document.getElementById("color").value,
        recognitionLang: select_language.dataset.encoding,
        isDebug: document.getElementById("debugSwitch").checked
    }, function () {
        // Update status to let user know options were saved.
        let status = document.getElementById("status");
        status.textContent = chrome.i18n.getMessage("optionsSaved");
        setTimeout(function () {
            status.textContent = "";
        }, 5000);
    });
}

function restore_options() {
    chrome.storage.sync.get([
        "favoriteColor",
        "recognitionLang",
        "isDebug"
    ], function (items) {
        if (typeof items.isDebug === "undefined") {
            items.isDebug = false;
        }
        document.getElementById("debugSwitch").checked = items.isDebug;

        if (typeof items.favoriteColor === "undefined") {
            items.favoriteColor = "DarkOrchid";
        }
        document.getElementById("color").value = items.favoriteColor;


        if (typeof items.recognitionLang === "undefined") {
            //check, if default browser language is in list of supported SpeechRecognition languages
            let tmpLang = window.navigator.language || window.navigator.userLanguage;
            if (checkEncodingSupport(tmpLang)) {
                items.recognitionLang = tmpLang;
            } else {
                //if not, fallback to english GB lang
                items.recognitionLang = "en-GB";
            }
        }
        initLanguages(items.recognitionLang);
    });
}

document.getElementById("select_language").addEventListener("change", updateCountry);
document.getElementById("select_dialect").addEventListener("change", updateEncoding);
document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
document.getElementById("speechAssistantOptions").innerHTML = chrome.i18n.getMessage("speechAssistantOptions");
document.getElementById("speechAssistantOptionsHeader").innerHTML = chrome.i18n.getMessage("speechAssistantOptionsHeader");
document.getElementById("warningPanelColor").innerHTML = chrome.i18n.getMessage("warningPanelColor");
document.getElementById("recognizedLanguage").innerHTML = chrome.i18n.getMessage("recognizedLanguage");
document.getElementById("save").innerHTML = chrome.i18n.getMessage("save");
document.getElementById("enableDebug").innerHTML = chrome.i18n.getMessage("enableDebug");

function initLanguages(encoding) {

    select_language.dataset.encoding = encoding;

    for (let i = 0; i < langsList.length; i++) {
        select_language.options[i] = new Option(langsList[i][0], i);

        let encList = langsList[i];
        let encListLength = encList.length;

        if (encListLength === 2) {
            //check first entry in second element
            if (encList[1][0] === encoding) {
                //if we found encoding, select current option in language dropdown and hide dialect dropdown
                select_language.selectedIndex = i;
                select_dialect.style.visibility = "hidden";
            }
        } else {
            let tmp = searchEncodingInList(encoding, encList);
            //if we found encoding, do select current option in language dropdown and show dialect dropdown
            if (tmp >= 0) {
                fillEncodingSelect(encList);
                select_language.selectedIndex = i;
                select_dialect.selectedIndex = tmp;
                select_dialect.style.visibility = "visible";
            }
        }
    }
}

function updateCountry() {
    for (let i = select_dialect.options.length - 1; i >= 0; i--) {
        select_dialect.remove(i);
    }
    let encList = langsList[select_language.selectedIndex];
    fillEncodingSelect(encList);
}

function fillEncodingSelect(encList) {
    for (let i = 1; i < encList.length; i++) {
        select_dialect.options.add(new Option(encList[i][1], encList[i][0]));
    }
    updateEncoding();
    //hide dialect list if only one encoding specified per country
    select_dialect.style.visibility = encList.length < 3 ? "hidden" : "visible";
}

function updateEncoding() {
    select_language.dataset.encoding = select_dialect.options[select_dialect.selectedIndex].value;
}

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