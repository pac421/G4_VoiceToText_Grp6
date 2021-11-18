import React from "react";
import { ToastContainer } from "react-toastify";

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