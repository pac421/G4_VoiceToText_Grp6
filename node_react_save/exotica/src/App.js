import React, {Component} from 'react';
import io from 'socket.io-client';
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
}

export default App;
