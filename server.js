const https = require('https');
const fs = require('fs');
const socketIO = require('socket.io');
const DeepSpeech = require('deepspeech-tflite');
const VAD = require('node-vad');
const mysql = require('mysql');
const os = require('os');

/*
 * MySQL
 */
const con = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'pass4root',
	database: 'db_exotica'
});

con.connect((err) => {
	if(err) throw err;
	console.log('Connected!');
});

/*
 * DeepSpeech
 */
let SILENCE_THRESHOLD = 200; // how many milliseconds of inactivity before processing the audio

const SERVER_PORT = 4000; // websocket server port
const VAD_MODE = VAD.Mode.VERY_AGGRESSIVE;
const vad = new VAD(VAD_MODE);

let customModel = new DeepSpeech.Model(__dirname + '/models/customModel_fr.tflite');
let modelStream;
let recordedChunks = 0;
let silenceStart = null;
let recordedAudioLength = 0;
let endTimeout = null;
let silenceBuffers = [];

function processAudioStream(data, callback) {
	vad.processAudio(data, 16000).then((res) => {
		switch (res) {
			case VAD.Event.ERROR:
				console.log("VAD ERROR");
				break;
			case VAD.Event.NOISE:
				console.log("VAD NOISE");
				break;
			case VAD.Event.SILENCE:
				processSilence(data, callback);
				break;
			case VAD.Event.VOICE:
				processVoice(data);
				break;
			default:
				console.log('default', res);
		}
	});
	
	// timeout after 1s of inactivity
	clearTimeout(endTimeout);
	endTimeout = setTimeout(function() {
		console.log('timeout');
		resetAudioStream();
	}, 1000);
}

function endAudioStream(callback) {
	console.log('[end]');
	let results = intermediateDecode();
	if (results) {
		if (callback) {
			callback(results);
		}
	}
}

function resetAudioStream() {
	clearTimeout(endTimeout);
	console.log('[reset]');
	intermediateDecode(); // ignore results
	recordedChunks = 0;
	silenceStart = null;
}

function processSilence(data, callback) {
	if (recordedChunks > 0) { // recording is on
		process.stdout.write('-'); // silence detected while recording
		
		feedAudioContent(data);
		
		if (silenceStart === null) {
			silenceStart = new Date().getTime();
		}
		else {
			let now = new Date().getTime();
			if (now - silenceStart > SILENCE_THRESHOLD) {
				silenceStart = null;
				console.log('[end]');
				let results = intermediateDecode();
				if (results) {
					if (callback) {
						callback(results);
					}
				}
			}
		}
	}
	else {
		process.stdout.write('.'); // silence detected while not recording
		bufferSilence(data);
	}
}

function bufferSilence(data) {
	// VAD has a tendency to cut the first bit of audio data from the start of a recording
	// so keep a buffer of that first bit of audio and in addBufferedSilence() reattach it to the beginning of the recording
	silenceBuffers.push(data);
	if (silenceBuffers.length >= 3) {
		silenceBuffers.shift();
	}
}

function addBufferedSilence(data) {
	let audioBuffer;
	if (silenceBuffers.length) {
		silenceBuffers.push(data);
		let length = 0;
		silenceBuffers.forEach(function (buf) {
			length += buf.length;
		});
		audioBuffer = Buffer.concat(silenceBuffers, length);
		silenceBuffers = [];
	}
	else audioBuffer = data;
	return audioBuffer;
}

function processVoice(data) {
	silenceStart = null;
	if (recordedChunks === 0) {
		console.log('');
		process.stdout.write('[start]'); // recording started
	}
	else {
		process.stdout.write('='); // still recording
	}
	recordedChunks++;
	
	data = addBufferedSilence(data);
	feedAudioContent(data);
}

function createStream() {
	modelStream = customModel.createStream();
	recordedChunks = 0;
	recordedAudioLength = 0;
}

function finishStream() {
	if (modelStream) {
		let start = new Date();
		let text = modelStream.finishStream();
		if (text) {
			console.log('');
			console.log('Recognized Text:', text);
			let recogTime = new Date().getTime() - start.getTime();
			return {
				text,
				recogTime,
				audioLength: Math.round(recordedAudioLength)
			};
		}
	}
	silenceBuffers = [];
	modelStream = null;
}

function intermediateDecode() {
	let results = finishStream();
	createStream();
	return results;
}

function feedAudioContent(chunk) {
	recordedAudioLength += (chunk.length / 2) * (1 / 16000) * 1000;
	modelStream.feedAudioContent(chunk);
}

/*
 * HTTPS
 */
const options = {
	key: fs.readFileSync('certs/server.key', 'utf8'),
	cert: fs.readFileSync('certs/server.cert', 'utf8'),
	requestCert: false,
    rejectUnauthorized: false
}

const app = https.createServer(options, (req, res) => {
	res.writeHead(200);
	res.write('web-microphone-websocket');
	res.end();
});

/*
 * Query
 */
const add_conversation = (obj) => {
	con.query('INSERT INTO CONVERSATION SET ?', obj, (err, res) => {
		if(err) throw err;
		console.log('new conversation inserted:', res.insertId);
	});
}

const add_conversation_keyword = (obj) => {
	console.log('add_conversation_keyword start');
	console.log('obj :', obj);
	con.query('INSERT INTO CONVERSATION_KEYWORD SET ?', obj, (err, res) => {
		if(err) throw err;
		console.log('new conversation_keyword inserted:', res.insertId);
	});
}

const set_conversation_end = (obj) => {
	con.query('UPDATE CONVERSATION SET ended_at = ? WHERE ID = ?', [obj.ended_at, obj.id], (err, result) => {
		if(err) throw err;
		console.log('setting conversation end');
	});
}

const get_cpu_percentage = () => {
	const cpus = os.cpus();
	const cpu = cpus[0];

	console.log('=========== CPU ===========');
	console.log(cpus, cpu);
	console.log('=========== CPU ===========');
	const total = Object.values(cpu.times).reduce(
		(acc, tv) => acc + tv, 0
	);

	const usage = process.cpuUsage();
	const currentCPUUsage = (usage.user + usage.system);

	const perc = currentCPUUsage / total * 100;

	return perc;
}
/*
 * SocketIO
 */
const io = socketIO(app, {});
io.origins('*:*');

io.on('connection', function(socket) {
	console.log('client connected');
	
	socket.once('disconnect', () => {
		console.log('client disconnected');
	});
	
	socket.on('stream-data', function(data) {
		processAudioStream(data, (results) => {
			socket.emit('recognize', results);
		});
	});
	
	socket.on('stream-end', function() {
		endAudioStream((results) => {
			socket.emit('recognize', results);
		});
	});
	
	socket.on('stream-reset', function() {
		resetAudioStream();
	});
	
	createStream();
	
	con.query('SELECT * FROM KEYWORD', (err, lst_keywords) => {
		if(err) throw err;
		socket.emit('get_keywords', lst_keywords);
	});

	socket.on('add_conversation', function(obj) {
		add_conversation(obj);
	});
	
	socket.on('add_conversation_keyword', function(obj) {
		add_conversation_keyword(obj);
	});
	
	socket.on('set_conversation_end', function(obj) {
		set_conversation_end(obj);
	});

	socket.on('get_stats', function() {
		con.query("SELECT COUNT(*) AS count FROM CONVERSATION_KEYWORD WHERE created_at > DATE_ADD(Current_TimeStamp, INTERVAL -1 DAY)", function(err, keywords_day){
			if(err) throw err;
		
			con.query('SELECT COUNT(*) AS count FROM CONVERSATION WHERE ended_at is null', (err, current_speaks) => {
				if(err) throw err;
			
				con.query('SELECT COUNT(*) AS count FROM CONVERSATION_KEYWORD', (err, actions_executed) => {
					if(err) throw err;

					con.query('SELECT * FROM CONVERSATION WHERE ended_at is not NULL', (err, endedConversations) => {
						let conversationAverage = 0, durationMs = 0;
						const divide = endedConversations.length;
						
						endedConversations.forEach( function(c){
							console.log(c);
							durationMs += (c.ended_at - c.started_at)
						});
						conversationAverage = durationMs / divide / 1000;
				
						let lst_stats = [
							{
								id: 'keywords_day',
								value: keywords_day[0]['count'],
								label: 'Mots-clés détectés (24h)',
								logo: 'calendar'
							},
							{
								id: 'current_speaks',
								value: current_speaks[0]['count'],
								label: 'Conversations en cours',
								logo: 'headset'
							},
							{
								id: 'actions_executed',
								value: actions_executed[0]['count'],
								label: "Actions réalisées",
								logo: 'plane'
							},
							{
								id: 'cpu_usage',
								value: Math.round(get_cpu_percentage() * 100) / 100 + '%',
								label: 'Utilisation du CPU',
								logo: 'chart'
							},
							{
								id: 'ram_usage',
								value: Math.round((((os.totalmem() - os.freemem()) * 100) / os.totalmem ) * 100) / 100 + '%',
								label: 'Utilisation de la RAM',
								logo: 'cogs'
							},
							{
								id: "conversation_average",
								value: Math.round(conversationAverage *100) /100 + 's',
								label: 'Durée moyenne d\'une conversation',
								logo: 'comments'
								
							}
						];
						console.log('lst_stats', lst_stats);
					
						socket.emit('return_stats', lst_stats);
					})
				});
			})
		})
	});
});

app.listen(SERVER_PORT, '0.0.0.0', () => {
	console.log('Socket server listening on:', SERVER_PORT);
});

module.exports = app;
