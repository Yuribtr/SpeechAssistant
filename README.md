# SpeechAssistant
SpeechAssistant is Chrome extension for Google Speech-to-Text recognition
-------------------------------------------------------------------------
With this extension you may transcribe your voice to text on any page. 

This is beta release of extension with following properties:
+ voice recognition based on Google Speech-to-Text Service (https://cloud.google.com/speech-to-text)
+ support recognition of 100 languages (as Google does) 
+ interface has English, Russian, Ukrainian interface
+ has detection of silence, automatic start/stop and reconnection
+ shows warning if speech recognition too bad
+ can be enabled/disabled for each domain independently
+ has Volume meter feature (a little buggy)
+ color scheme can be changed

### Installation
1. Download archive from [master branch](https://github.com/Yuribtr/SpeechAssistant/archive/refs/heads/master.zip)
2. Extract it and install to Chromimum based browser:
   - Open menu, click "Settings", click "Extensions" or use [this link](chrome://extensions/) 
   - Enable "Developer mode" (top-right corner)
   - Hit the button "Load unpacked"
   - In appeared window choose folder "src" inside folder with extracted extension (i.e. "..\SpeechAssistant-master\src")

### Usage
1. After installation, you will see an icon of "SpeechAssistant" in main bar of browser (it might be hid under Extensions button).
2. Open site where you need to put transcribed text.
3. Click on icon of "SpeechAssistant" and you will see popup with "SpeechAssistant" settings for this site only: 
   - Enable/Disable recognition for this site by clicking on switch (per-site config).
   - Change of language detection for all sites (global config).
4. After enabling detection on site you may put cursor in any input field on page to start transcription process.
5. If everything is OK, you will see notification popup with message that microphone is switched on. **Warning**! You will need to allow page to use microphone.
6. While cursor is located in any field on page you may start your speech using microphone. Result of transcribing will be shown in this field.
7. **Important**! Technology of transcribing depends on microphone's quality and voice loudness. Also there presence some delay between speech and transcribing (1-30 seconds). You have to do pauses in your speech to see results immediately.
8. If quality of transcribing will be too low, you will see corresponding notification.
9. After finishing of your speech you need to make pause and wait while text data will be shown in field. 
10. After this you may safely remove cursor from field, text recognition will be stopped. 

### Privacy Note:
This extension stores only preferences in local storage of browser and does NOT store any audio/text data from user input.
By using this extension, you automatically agree with Google's Privacy Policy: https://policies.google.com/privacy
