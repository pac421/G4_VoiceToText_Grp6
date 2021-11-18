import React, {Component} from 'react';
import { injectStyle } from "react-toastify/dist/inject-style";


// View

import Index from './components';                                                              

if (typeof window !== "undefined") {
  injectStyle();
}

class App extends Component {
	
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
