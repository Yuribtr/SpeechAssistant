# SpeechAssistant

-------------------------------------------------------------------------
### SpeechAssistant is Chrome extension for Google Speech-to-Text recognition.
With this extension, you can easily fill out forms and type text on pages using your voice.

This is stable release of extension with following properties:
+ voice recognition based on [Google Speech-to-Text Service](https://cloud.google.com/speech-to-text)
+ support recognition of more than 100 languages (as Google does) 
+ interface has English, Russian, Ukrainian languages, automatic language detection
+ has detection of silence, automatic start/stop recognition and reconnection to service
+ shows warning if speech recognition too bad
+ can be enabled/disabled for each domain (site) independently
+ color scheme can be changed
+ interface adopted for high contrast browser mode

At present this extension doesn't available via Chrome WebStore, sorry. I'm working on that.

You may install extension via Developer mode of Chromium based browsers (Chrome, Edge, Yandex tested *). Opera and other browsers lacks [necessary technology](https://caniuse.com/?search=SpeechRecognition). 

* Notes: 
- Edge has issue, it can't give correct confidence level of detection. Therefore, warning will always be displayed.
- Yandex has issue, it can't give correct confidence level of detection. Therefore, no warning at all will be displayed. Also networks problems raising.

Below you can find installation instructions for Chrome, for other browsers you might need to do some additional steps.

### Installation
1. Download archive from [master branch](https://github.com/Yuribtr/SpeechAssistant/archive/refs/heads/master.zip)
2. Extract it and install to Chromimum based browser:
   - Open menu, click "Settings", click "Extensions" or use link: [chrome://extensions/](chrome://extensions/)
   - Enable "Developer mode" (top-right corner)
   - Hit the button "Load unpacked"
   - In appeared window choose folder "src" inside folder with extracted extension (i.e. "..\SpeechAssistant-master\src")


### Usage
1. After installation, you will see an icon of "SpeechAssistant" in main bar of browser (it might be hid under Extensions button).
2. Open site where you need to put transcribed text.
3. Click on icon of "SpeechAssistant" and you will see popup with "SpeechAssistant" settings for this site: 
   - Enable/Disable recognition for this site by clicking on switch (per-site config).
   - Change of language detection for all sites (global config).
4. After enabling detection on site you may put cursor to input field on page to start transcription process. Supported original control: input, textarea.
5. If everything is OK, you will see notification popup with message that microphone is switched on. **Warning**! You will need to allow page to use microphone.
6. While cursor is located in any field on page you may start your speech using microphone. Result of transcribing will be shown in this field.
7. **Important**! Technology of transcribing depends on microphone's quality and voice loudness. Also there presence some delay between speech and transcribing (1-30 seconds). You have to do pauses in your speech to see results immediately. For this reason, after the end of dictation, do not remove the focus from the input field until you see the recognized text.
8. If quality of transcribing will be too low, you will see corresponding notification (Works reliably only in Chrome).
9. After finishing of your speech you need to make pause and wait while text data will be shown in field.
10. After this you may safely remove cursor from field, text recognition will be stopped. 


### Privacy Note:
This extension stores only preferences in local storage of browser and does NOT store any audio/text data from user input.
By using this extension, you automatically agree with [Google's Privacy Policy](https://policies.google.com/privacy).

-------------------------------------------------------------------------

### SpeechAssistant - это расширение браузера Chrome для распознавания речи через STT сервис Google.
С этим расширением вы можете легко заполнять формы и печатать текст на страницах используя свой голос.

Это стабильная версия расширения со следующими возможностями:
+ распознавание голоса движком [Google Speech-to-Text](https://cloud.google.com/speech-to-text)
+ поддержка распознавания речи более чем на 100 языках (сколько умеет Google)
+ интерфейс на английском, русском и украинском языках, автоматическое определение языка
+ есть детектор тишины, автоматический старт/стоп распознавания и переподсоединение к сервису
+ показывает предупреждения если качество распознавания слишком низкое
+ распознавание может быть включено/выключено для каждого домена (сайта) отдельно
+ цветовая схема может быть изменена
+ есть адаптация интерфейса к режиму высокой контрастности

К сожалению, на текущий момент данное расширение отсутствует в Chrome WebStore. Я работаю над этим.

Вы можете установить расширение через "Режим разработчика" в браузерах на базе движка Chromium (Chrome, Edge, Yandex протестирован *). В Opera и других браузерах отсутствует [необходимая технология](https://caniuse.com/?search=SpeechRecognition). 

* Примечания:
- В Edge есть проблема, он не может выдавать правильный уровень достоверности распознавания. Поэтому предупреждение все время будет показываться.
- В Yandex есть проблема, он не может выдавать правильный уровень достоверности распознавания. Поэтому предупреждение никогда не будет показываться. Также возникают проблемы с сетью.

Ниже приведены инструкции по инсталляции для Chrome. Для других браузеров вам могут понадобиться дополнительные действия.

### Установка
1. Загрузить архив из [master ветки репозитория](https://github.com/Yuribtr/SpeechAssistant/archive/refs/heads/master.zip)
2. Извлечь и установить расширение в браузер:
   - Открыть меню, нажать "Настройки", нажать "Расширения" или использовать ссылку [chrome://extensions/](chrome://extensions/)
   - Включить "Режим разработчика" (верхний-правый угол)
   - Нажмите кнопку "Загрузить распакованное расширение"
   - В открытом окне выберите папку "src" внутри папки с извлеченным расширением (например "..\SpeechAssistant-master\src")


### Использование
1. После установки вы увидите иконку "SpeechAssistant" на главной панели браузера (она может быть скрыта под кнопкой "Расширения").
2. Откройте сайт, куда вы хотите вставлять распознанный текст.
3. Нажмите иконку "SpeechAssistant" и вы увидите всплывающее окно с настройками "SpeechAssistant" для этого сайта:
   - Включить/Выключить распознавание для сайта нажатием на переключатель (для каждого сайта отдельно).
   - Изменить язык распознавания для всех сайтов (глобальная настройка).
4. После включения распознавания на сайте вы можете поместить курсор в поле ввода на странице для начала распознавания речи. Поддерживаются оригинальные элементы: input, textarea.
5. Если все нормально, вы увидите всплывающее уведомление с сообщением что микрофон включен. **Внимание**! Вы должны разрешить странице использование микрофона.
6. Пока курсор находится в фокусе поля ввода вы можете говорить в микрофон. Результат распознавания будет отображаться в этом же поле.
7. **Важно**! Технология распознавания зависит от качества микрофона и громкости речи. Также присутствует задержка между речью и распознаванием (1-30 секунд). Вам надо делать паузы чтобы увидеть результаты распознавания незамедлительно. По этой причине после окончания диктовки не убирайте фокус с поля ввода пока не увидите распознанный текст.
8. Если качество распознавания будет слишком низкое, вы увидите соответствующее предупреждение (Надежно работает только в Chrome).
9. После завершения диктовки сделайте паузу и дождитесь пока текст не будет показан в поле ввода.
10. После этого вы можете безопасно убрать курсор из поля ввода, и распознавание будет остановлено.


### Сведения о конфиденциальности:
Это расширение сохраняет настройки только в хранилище браузера и НЕ сохраняет какие либо аудио или текстовые данные полученные от пользователя.
Используя это расширение вы автоматически соглашаетесь с [Политикой приватности Google](https://policies.google.com/privacy).