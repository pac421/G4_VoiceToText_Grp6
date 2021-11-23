import React, {Component} from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { injectStyle } from "react-toastify/dist/inject-style";
import { ToastContainer, toast } from "react-toastify";
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';

let lst_logo = {
	chart: require('./assets/pictures/chart.png'),
	calendar: require('./assets/pictures/calendar.png'),
	headset: require('./assets/pictures/headset.png'),
	plane: require('./assets/pictures/plane.png'),
	comments: require('./assets/pictures/comments.png'),
	cogs: require('./assets/pictures/cogs.png'),
};

if (typeof window !== "undefined")
  injectStyle();

const DOWNSAMPLING_WORKER = './downsampling_worker.js';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			connected: false,
			recording: false,
			recordingStart: 0,
			recordingTime: 0,
			recognitionOutput: [],
			keywords: [],
			convObject: {},
			convkeyObject: {},
			stats: []
		};
	}
	
	componentDidMount() {
		let recognitionCount = 0;
		
		this.socket = io.connect('https://localhost:4000', {secure: true, reconnect: true, rejectUnauthorized : false});
		
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
		
		this.socket.on('get_keywords', (lst_keywords) => {
			console.log('get_keywords:', lst_keywords);
			this.setState({keywords: lst_keywords});
		});

		this.socket.on('return_stats', (lst_stats) => {
			console.log('return_stats:', lst_stats);
			this.setState({stats: lst_stats});
		});
		
		this.socket.emit('get_stats');
		setInterval(() => {
			this.socket.emit('get_stats');
		}, 10000);
	}
	
	
	
	toggle_mic = () => {
		console.log('toggle_mic start');
		console.log('connected :', this.state.connected);
		if(this.state.recording)
			this.stopRecording();
		else 
			this.startRecording();
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
		console.log('convObject:', this.state.convkeyObject);
		
		toast.info(keyword.action, {
			position: "top-right",
			autoClose: 8000,
			hideProgressBar: false,
			closeOnClick: false,
			pauseOnHover: true,
			draggable: true,
			progress: undefined
		});
		
		this.setState({
			convkeyObject: { 
				id_conversation: this.state.convObject.id,
				id_keyword: keyword.id, 
				created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
			}
		});
		
		console.log('new conv_keyword object:', this.state.convkeyObject);
		
		if (this.socket.connected)
			this.socket.emit('add_conversation_keyword', this.state.convkeyObject);
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
		
		return (
			<div className="App">
				<div className="container bg-white vh-100 vw-100" style={{borderTop: "solid #0082ae 20px"}}>
					<h2 className="py-4" style={{color: "#0082ae"}}>Elaboration PNR par reconnaissance vocale</h2>
					
					<div className="row">
						<div className="col-lg-3">
							<div className="h-100 w-100 d-flex justify-content-center align-items-center flex-column">
							
								<div onClick={this.toggle_mic} className={"mb-2 mic_btn " + (this.state.recording ? 'active' : '')}>
									<FontAwesomeIcon icon={faMicrophone} />
								</div>
								
								{this.renderTime()}
							</div>
						</div>
						<div className="col-lg-9">
							<div className="w-100 rounded p-2" style={{height: "200px", backgroundColor: "#B1D9E6", border: "1px solid #0082AE", overflowY: "auto"}}>
								{this.renderRecognitionOutput()}
							</div>
						</div>
					</div>
					
					<div className="container-fluid rounded my-5 pb-3" style={{backgroundColor: "#daedf3", color: "#0082ae"}}>
						<h4 className="pt-3">Commandes manuelles</h4>
						
						<div className="row gy-2">
							{
								this.state.keywords.map(k => (
									<div className="col-6" key={k.id}>
										<div 
											className={"p-2 border bg-white text-center rounded " + (this.state.recording ? 'hoverable' : '')}
											onClick={() => {
												if(this.state.convObject.id !== undefined)
													this.keyword_detected(k);
											}}
										>
											{k.label}
										</div>
									</div>
								))
							} 
						</div>
					</div>
					
					<div className="row gy-4 pb-3" style={{backgroundColor: "#0082ae"}}>
						{
							this.state.stats.map(k => (
								<div className="col-4" key={k.id}>
									<div className="p-2 border bg-white rounded d-flex flex-column justify-content-center align-items-center">
										<div className="mb-2">
											 <img src={lst_logo[k.logo]} alt={k.logo} height="55px"></img>
										</div>
										<div>
											{k.label}
										</div>
										<div style={{color: "#0082ae", fontSize: '30px'}}>
											{k.value}
										</div>
									</div>
								</div>
							))
						} 
					</div>
					
					<ToastContainer />
				</div>
			</div>
			
		);
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
				this.socket.emit('add_conversation', this.state.convObject);
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
				this.socket.emit('set_conversation_end', {
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
