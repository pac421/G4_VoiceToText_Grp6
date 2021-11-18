import React, {Component} from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { injectStyle } from "react-toastify/dist/inject-style";
import { toast } from "react-toastify";
import $ from 'jquery';

// View

import Index from './components';
import './css/analyses.css';                                                                   
import './css/styles.css';                                                                    
import 'bootstrap/dist/css/bootstrap.min.css';    

if (typeof window !== "undefined") {
  injectStyle();
}

const DOWNSAMPLING_WORKER = './downsampling_worker.js';

class App extends Component {
	componentDidMount() {
		let recognitionCount = 0;
		
		this.socket = io.connect('https://192.168.3.212:4000', {secure: true});
		
		this.socket.on('connect', () => {
			console.log('socket connected');
			this.setState({connected: true});
		});
		
		this.socket.on('disconnect', () => {
			console.log('socket disconnected');
			this.setState({connected: false});
			this.stopRecording();
		});
		
		this.socket.on('recognize', (results) => {
			console.log('recognized:', results);
			const {recognitionOutput} = this.state;
			results.id = recognitionCount++;
			recognitionOutput.unshift(results);
			this.setState({recognitionOutput});
			
			this.try_recognition(results.text);
		});
		
		this.socket.on('keywords', (arr) => {
			console.log('keywords:', arr);
			this.setState({keywords: arr});
		});
	}
	
	try_recognition = word => {
		console.groupCollapsed("try_recognition for '" + word + "'");
		let lDist = 100;
		let word_combinations = this.getKeywordsList(word);
		let detected_keywords = [];
		console.log('word_combinations: ', word_combinations);
		$.each(word_combinations, (index, value) => {
			$.each(this.state.keywords, (i, v) => {
				if(!detected_keywords.includes(v)) {
					lDist = this.levenshteinDistance(value, v.label);
					console.log('levenshteinDistance between ' + value + ' and ' + v.label + ': ' + lDist);
					if(lDist < 5) {
						this.keyword_detected(v);
						detected_keywords.push(v);
					}
				}
			});
		});
		console.groupEnd();
	}
	
	keyword_detected = keyword => {
		console.log('keyword detected:', keyword.label);
		
		toast.success(keyword.label, {
			position: "top-right",
			autoClose: 3000,
			hideProgressBar: false,
			closeOnClick: false,
			pauseOnHover: true,
			draggable: true,
			progress: undefined
		});
	}
	
	levenshteinDistance = (str1 = '', str2 = '') => {
		const track = Array(str2.length + 1).fill(null).map(() =>
			Array(str1.length + 1).fill(null));
		for (let i = 0; i <= str1.length; i += 1) {
			track[0][i] = i;
		}
		for (let j = 0; j <= str2.length; j += 1) {
			track[j][0] = j;
		}
		for (let j = 1; j <= str2.length; j += 1) {
			for (let i = 1; i <= str1.length; i += 1) {
				const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
				track[j][i] = Math.min(
					track[j][i - 1] + 1, // deletion
					track[j - 1][i] + 1, // insertion
					track[j - 1][i - 1] + indicator, // substitution
				);
			}
		}
		return track[str2.length][str1.length];
	};
	
	getKeywordsList = (text) => {
		var wordList = text.split(' ');
		var keywordsList = [];
		while (wordList.length > 0) {
			keywordsList = keywordsList.concat(this.genKeyWords(wordList));
			wordList.shift();
		}
		return keywordsList;
	}

	genKeyWords = (wordsList) => {
		var res = [wordsList.join(' ')];
		if (wordsList.length > 1)
			return res.concat(this.genKeyWords(wordsList.slice(0, -1)));
		else 
			return res;
	}
	
	render() {
		// return (
		// 	<div className="App">
		// 		<div>
		// 			<button disabled={!this.state.connected || this.state.recording} onClick={this.startRecording}>
		// 				Start Recording
		// 			</button>
					
		// 			<button disabled={!this.state.recording} onClick={this.stopRecording}>
		// 				Stop Recording
		// 			</button>
					
		// 			{this.renderTime()}
		// 		</div>
		// 		{this.renderRecognitionOutput()}
		// 		<ToastContainer />
		// 	</div>
			
		// );

		return (<Index />);
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
		downsampler.postMessage({command: "init", inputSampleRate: sampleRate});
		downsampler.onmessage = (e) => {
			if (this.socket.connected) {
				this.socket.emit('stream-data', e.data.buffer);
			}
		};
		
		processor.onaudioprocess = (event) => {
			var data = event.inputBuffer.getChannelData(0);
			downsampler.postMessage({command: "process", inputFrame: data});
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
				this.setState({recordingTime});
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
}

export default App;
