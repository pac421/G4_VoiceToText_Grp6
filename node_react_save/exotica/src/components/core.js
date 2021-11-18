import React from "react";
import { ToastContainer } from "react-toastify";
import { v4 as uuidv4 } from 'uuid';

const DOWNSAMPLING_WORKER = './downsampling_worker.js';

class core extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            connected: false,
            recording: false,
            recordingStart: 0,
            recordingTime: 0,
            recognitionOutput: [],
            keywords: [],
            convObject: {}
        };
    }

    renderTime() {
        return (<span>
            {(Math.round(this.state.recordingTime / 100) / 10).toFixed(1)}s
        </span>);
    }

    renderRecognitionOutput() {
        return (<ul>
            {this.state.recognitionOutput.map((r) => {
                return (<li key={r.id}>{r.text}</li>);
            })}
        </ul>)
    }


    createAudioProcessor(audioContext, audioSource) {
        let processor = audioContext.createScriptProcessor(4096, 1, 1);

        const sampleRate = audioSource.context.sampleRate;

        let downsampler = new Worker(DOWNSAMPLING_WORKER);
        downsampler.postMessage({ command: "init", inputSampleRate: sampleRate });
        downsampler.onmessage = (e) => {
            if (this.socket.connected) {
                this.socket.emit('stream-data', e.data.buffer);
            }
        };

        processor.onaudioprocess = (event) => {
            var data = event.inputBuffer.getChannelData(0);
            downsampler.postMessage({ command: "process", inputFrame: data });
        };

        processor.shutdown = () => {
            processor.disconnect();
            this.onaudioprocess = null;
        };

        processor.connect(audioContext.destination);

        return processor;
    }

    startRecording = e => {
        if (!this.state.recording) {
            this.recordingInterval = setInterval(() => {
                let recordingTime = new Date().getTime() - this.state.recordingStart;
                this.setState({ recordingTime });
            }, 100);

            this.setState({
                recording: true,
                recordingStart: new Date().getTime(),
                recordingTime: 0
            }, () => {
                this.startMicrophone();
            });
        }
    };

    startMicrophone() {
        this.audioContext = new AudioContext();

        const success = (stream) => {
            console.log('started recording');
            this.mediaStream = stream;
            this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
            this.processor = this.createAudioProcessor(this.audioContext, this.mediaStreamSource);
            this.mediaStreamSource.connect(this.processor);

            this.setState({
                convObject: {
                    id: uuidv4(),
                    started_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    ended_at: null
                }
            });

            console.log('new conversation object:', this.state.convObject);

            if (this.socket.connected)
                this.socket.emit('new_conv', this.state.convObject);
        };

        const fail = (e) => {
            console.error('recording failure', e);
        };

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true
            })
                .then(success)
                .catch(fail);
        }
        else {
            navigator.getUserMedia({
                video: false,
                audio: true
            }, success, fail);
        }
    }

    stopRecording = e => {
        if (this.state.recording) {
            if (this.socket.connected) {
                this.socket.emit('stream-reset');
                this.socket.emit('set_conv_end', {
                    id: this.state.convObject.id,
                    ended_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
                });
            }

            clearInterval(this.recordingInterval);
            this.setState({
                recording: false
            }, () => {
                this.stopMicrophone();
            });
        }
    };

    stopMicrophone() {
        if (this.mediaStream)
            this.mediaStream.getTracks()[0].stop();

        if (this.mediaStreamSource)
            this.mediaStreamSource.disconnect();

        if (this.processor)
            this.processor.shutdown();

        if (this.audioContext)
            this.audioContext.close();
    }

    render() {
        return (
            <div className="App">
                <div>
                    <button disabled={!this.state.connected || this.state.recording} onClick={this.startRecording}>
                        Start Recording
                    </button>

                    <button disabled={!this.state.recording} onClick={this.stopRecording}>
                        Stop Recording
                    </button>

                    {this.renderTime()}
                </div>
                {this.renderRecognitionOutput()}
                <ToastContainer />
            </div>
        );
    }
}

export default core;