let isDebug = true;

class VMonitorProcessor extends AudioWorkletProcessor {

    constructor() {
        consoleLog("Creating VMonitorProcessor");
        super();
        this._lastUpdate = currentTime;
        //update interval for messages in s
        this._updateInterval = 0.5;
        //this is hardcoded in Chrome WebAudio library
        this._sampleQuantity = 128;
        //this is global config
        this._sampleRate = sampleRate;
        this._enabled = true;
        this.port.onmessage = this.handleMessage.bind(this);
        //this needed to avoid "currentTime" calls in each timeframe
        //as we will send messages more rarely, than event "process" occurs
        //375 ticks per 1 second with 128 samples = 48000 KHz sampleRate
        this._resetCounter = sampleRate / this._sampleQuantity * this._updateInterval;
        this._counter = 0;
        this._volume = 0;
        this._volumeDB = -100;
    }

    handleMessage(event) {
        consoleLog("VMonitorProcessor received message: " + event.data.message);
        if (event.data.message === "stopMonitoring") {
            this._enabled = false;
            consoleLog("VMonitorProcessor stopped to work");
        }
    }

    process(inputs, outputs, parameters) {
        if (!this._enabled) {
            return false;
        }
        // By default, the node has single input and output
        //we use the first one
        const input = inputs[0];
        const channel = input[0];
        // do below in each timeframe
        if (this._counter >= this._resetCounter) {
            //send message if reach _updateInterval and resets temporary variables
            let summ = 0;
            this._volume = 0;
            this._volumeDB = -100;
            for (let frame = 0; frame < channel.length; ++frame) {
                summ += channel[frame] * channel[frame];
            }
            this._volume = Math.sqrt(summ / channel.length);
            //clipping volume
            this._volume = this._volume > 1 ? 1 : this._volume;
            //converting to decibels
            this._volumeDB = Math.round(20 * Math.log10(this._volume));
            this.port.postMessage({
                message: "volume is " + this._volumeDB + " dB"
            });
            this._counter = 0;
        } else {
            //increment counter only if it is was not reseted to avoid missing frames
            //with _updateInterval abt 1 ms or less, there might be at least 1 tick happened
            this._counter++;
        }
        return this._enabled;
    }
}

//The AudioWorkletProcessor and classes that derive from it cannot be instantiated directly from a user-supplied code
//Instead, they are created only internally by the creation of an associated AudioWorkletNodes.
registerProcessor("vmonitor-processor", VMonitorProcessor);

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function timeStamp() {
    let d = new Date();
    return d.toLocaleTimeString();
}

function consoleLog(text) {
    if (isDebug) {
        console.log(timeStamp() + " " + text);
    }
}