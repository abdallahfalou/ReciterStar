console.log("Hello, reciterstar.js");
window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var isPlaying = false;
var isLiveInput = false;
var demoSourceNode = null;
var micSourceNode = null;
var analyser = null;
var theBuffer = null;
var detectorElem, 
	canvasContext,
	pitchElem,
	noteElem,
	detuneElem,
	detuneAmount;
var WIDTH=300;
var CENTER=143;
var HEIGHT=42;
var confidence = 0;
var currentPitch = 0;
var bufferLength = 1024;

var templatePitchIndex = 0;
var templatePitchArray = [131.4748,135.039,140.6418,0,302.9091,70,175.3046,173.3116,174.3784,174.0779,176.2342,178.5949,179.0996,176.3909,163.6106,157.4224,156.8557,159.7837,162.7734,165.0131,164.3183,174.1668,177.8245,179.8042,177.1973,177.7879,178.4452,177.886,171.5493,173.1641,174.8229,164.9334,161.8467,151.4262,154.91,157.3179,158.9385,20,146.6632,0,145.4925,0,146.3472,147.2468,148.1626,148.4298,145.6876,148.1459,60,141.2599,154.1097,159.6394,157.8026,155.3862,152.8967,156.2589,159.9164,157.416,152.7287,150.9215,153.9027,153.3998,154.6073,153.2787,146.4453,147.4973,146.8491,0,132.1495,20,130.3243,129.4752,132.0702,131.9352,131.7122,133.1277,30,141.8509,148.0947,159.1723,158.4589,146.7367,143.1001,147.9491,148.6142,135.468,130.1297,130.3464,134.7702,141.7259,145.0986,145.9732,136.0361,133.8943,137.1534,135.1794,125.9643,124.5116,126.6258,129.869,132.5492,131.4116,131.0913,132.7929,133.9681,135.0504,133.2555,132.3418,263.2681,264.1009,134.5321,133.7961,133.6487,132.8929,130.5424,133.0699,134.4093,135.4607,134.0346,133.189,132.5239,134.2537,135.3952,134.6912,133.7533,131.9549,131.9514,135.1158,135.9964,135.1737,133.0763,132.5056,133.6511,273.7754,135.0754,135.33,134.6116,2133.13,265.1713,132.1029,135.2279,133.4195,130.8391,130.5781,132.3311,134.0979,134.2605,132.6877,133.0526,133.3986,133.2463,131.7182,132.8651,135.5666,134.2199,0,132.1401,131.2544,134.7202,271.7708,0,134.6034,0,134.1551,134.8886,136.2454,132.1052,129.1294,0,128.5434,128.3702,129.4117,130.8107,40,161.9685,166.0887,0,191.5909,196.969,202.0621,203.4838,203.6693,20,197.5516,394.969,198.4732,201.0758,199.1123,198.2637,198.1495,199.2599,199.6784,199.0577,200.1762,200.1835,199.3774,198.5375,199.5948,207.9997,211.8912,209.0004,202.6952,202.2147,206.3259,207.8159,198.9151,209.1567,215.5712,207.3173,204.9742,199.4552,202.6091,202.9396,200.031,198.395,195.9932,197.8196,0,201.6878,200.1169,198.8905,195.517,0,196.6842,0,196.3153,199.421,196.1234,199.9337,204.2296,191.2305,179.0375,20,177.5895,175.129,171.9313,172.5979,176.0436,176.4791,176.3521,175.468,176.421,177.642,176.7137,174.0057,174.5912,175.4606,20,157.6365,158.1573,158.3433,162.7772,173.6759,173.7098,176.7835,176.3845,176.2149,176.6918,177.6988,176.9945,176.0393,176.2061,178.0455,180.4131,179.3413,177.5705,176.6247,177.2086,179.081,182.5494,181.9393,179.2167,177.5105,178.3933,180.2309,183.0334,180.3821,178.5345,177.8417,177.6845,180.2763,181.7907,180.6337,178.3228,176.6247,177.4504,180.4425,181.1775,180.4841,178.7626,178.7436,176.8333,178.6963,179.9449,179.7007,177.4802,2176.147,181.5803,178.8813,177.0097,177.9842,179.1266,178.672,179.2036,179.5836,179.2994,177.3233,178.0258,20,179.9764,362.1538,177.3258,177.3227,182.2109,181.023,178.9226,176.6613,178.0139,179.3176,20,193.5041,30,173.4953,175.5655,176.0042,176.5828,177.0022,177.9646,177.8686,179.4302,70,150.3255,150.7638,156.1756,155.3763,152.6953,152.517,156.0262,160.5621,159.4768,153.1189,154.6029,156.4324,159.9016,159.172,156.5471,158.2159,157.3337,152.173,40,147.7737,148.3728,158.2612,151.5261,148.238,40,155.0804,157.0159,173.017,180.5006,170.8197,159.4008,150.849,151.7515,155.1228,158.6981,157.566,150.7565,149.9963,150.5468,153.3651,154.488,157.2037,156.5714,154.7302,155.6749,155.0789,156.5804,157.1709,156.7903,156.0343,155.7421,154.4867,155.932,157.9544,157.5639,156.64,154.2988,154.9979,157.2075,159.0715,158.0258,156.1148,154.9836,156.6758,158.4356,158.8835,157.6436,155.7293,155.6833,156.7242,160.2581,159.5683,157.3013,156.1999,156.1035,158.6056,160.2127,160.0674,157.9477,156.6807,157.7499,160.4999,160.9677,158.7951,2156.757,158.7458,162.0296,160.2746,159.5043,157.888,158.4626,159.5994,159.5417,159.7188,157.5789,157.1122,156.3625,156.2198,20,160.6808,322.3533,157.7879,155.533,157.9362,159.0094,157.1378,158.9676,157.3358,157.8378,158.7233,160.5586,0,131.5587,136.4078,20,154.1465,167.0083,176.8745,179.2622,171.2145,172.3419,177.6131,173.3743,158.7145,155.2467,156.6744,152.6272,40,150.1183,148.831,148.8606,148.6883,147.8901,147.5211,145.9692,145.7726,148.6278,146.9079,140.6169,133.0421,131.28,133.4453,131.5125,133.8664,273.7303,261.4445,0,132.5654,126.9258,128.2012,60,131.6532,0,153.0691,169.1889,175.9472,176.0332,159.317,153.4241,156.0487,160.1515,156.1967,146.7652,146.37,150.0842,152.4086,157.7808,155.7287,146.6008,148.1302,149.9009,139.4636,134.2851,130.7215,134.5533,140.0357,144.6136,147.5989,147.2995,147.7785,147.5984,146.1721,147.8957,150.0574,151.7176,150.9741,147.7324,147.3348,147.1001,150.2441,151.5928,150.5455,150.3524,148.1506,146.8346,146.9788,149.733,153.4672,152.3185,149.632,148.9914,149.2481,149.8701,150.2568,153.5139,153.0815,150.0555,147.821,149.0979,151.3565,151.7998,150.4042,147.1109,146.4072,148.1242,151.0396,150.3901,148.3166,145.9832,147.2218,147.9952,151.051,150.1577,148.322,147.3955,148.1063,149.071,150.3426,149.0182,148.799,149.0394,149.4918,146.4322,150.6205,0,149.252,149.5154,294.8597,144.6975,148.2264,150.0513,149.3175,150.078];
// var templateSampleRate = 22050;

var testPitchArray = new Array();
var pitchDiff = new Array();
var FreqUpdate=5;

var v = document.getElementsByTagName("video")[0] 

var start = new Date().getTime();
var testPitchTS = new TimeSeries();
var templatePitchTS = new TimeSeries();

window.onload = function() {
	var request = new XMLHttpRequest();

request.open("GET", "./media/Fatiha.mp4", true);
//request.open("GET", "./media/Whistle.mp3", true);
	request.responseType = "arraybuffer";
	request.onload = function() {
	  audioContext.decodeAudioData( request.response, function(buffer) { 
	    	theBuffer = buffer;

		} );
	}
	request.send();
	
	detectorElem = document.getElementById( "detector" );
	pitchElem = document.getElementById( "pitch" );
	noteElem = document.getElementById( "note" );
	detuneElem = document.getElementById( "detune" );
	detuneAmount = document.getElementById( "detune_amt" );
	canvasContext = document.getElementById( "output" ).getContext("2d");

	detectorElem.ondragenter = function () { 
		this.classList.add("droptarget"); 
		return false; };
	detectorElem.ondragleave = function () { this.classList.remove("droptarget"); return false; };
	detectorElem.ondrop = function (e) {
  		this.classList.remove("droptarget");
  		e.preventDefault();
		theBuffer = null;

	  	var reader = new FileReader();
	  	reader.onload = function (event) {
audioContext.decodeAudioData( event.target.result, function(buffer) {
	    		theBuffer = buffer;
	  		}, function(){alert("error loading!");} ); 

	  	};
	  	reader.onerror = function (event) {
	  		alert("Error: " + reader.error );
		};
	  	reader.readAsArrayBuffer(e.dataTransfer.files[0]);


	  	return false;
	};
}

function error() {
    alert('Stream generation failed.');
}

function getUserMedia(dictionary, callback) {
    try {
        navigator.getUserMedia = 
        	navigator.getUserMedia ||
        	navigator.webkitGetUserMedia ||
        	navigator.mozGetUserMedia;
        navigator.getUserMedia(dictionary, callback, error);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
}

function toggleLiveInput() {
    if (isLiveInput) {
    	console.log("Stop mic stream");
    	// stop recording from mic using stream.stop() or something like that
    	// micSourceNode.stop();
    	micSourceNode = null;
    	analyser = null;
    	isLiveInput = false;
    	if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
        window.cancelAnimationFrame( rafID );

    	return "Mic";
    }

    getUserMedia({audio:true}, function(stream) {
    	console.log("Got mic stream");
		// Create an AudioNode from the stream.
		micSourceNode = audioContext.createMediaStreamSource(stream);

		// Connect it to the destination.
		analyser = audioContext.createAnalyser();
		analyser.fftSize = bufferLength;
		micSourceNode.connect( analyser );
		isLiveInput = true;
		isPlaying = false;
		updatePitch();
    });
    return "Stop";
}


function togglePlayback() {
    var now = audioContext.currentTime;

    if (isPlaying) {
        //stop playing and return
        demoSourceNode.stop( now );
        demoSourceNode = null;
        analyser = null;
        isPlaying = false;
		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
        window.cancelAnimationFrame( rafID );
        return "start";
    }

    // Reset testing pitch array
	if (testPitchArray.length > 0) {
		testPitchArray = new Array();
	}

    demoSourceNode = audioContext.createBufferSource();
    demoSourceNode.buffer = theBuffer;
    demoSourceNode.loop = true;

    analyser = audioContext.createAnalyser();
	  		v.play()
    analyser.fftSize = bufferLength;
    demoSourceNode.connect( analyser );
    analyser.connect( audioContext.destination );
    demoSourceNode.start( now );
    isPlaying = true;
    isLiveInput = false;
    updatePitch();

    return "stop";
}

var rafID = null;
var tracks = null;
var buf = new Uint8Array( bufferLength );
var MINVAL = 134;  // 128 == zero.  MINVAL is the "minimum detected signal" level.

var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function noteFromPitch( frequency ) {
	var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
	PitchUpdate=Math.round( noteNum ) + 69
	return Math.round( noteNum ) + 69;
	
	
}

// BUG: pitchDiff is empty?
function displayPitchArray() {
	//console.log(templatePitchArray)
	if (templatePitchArray.length < testPitchArray.length) {
		for (var i = 0; i < templatePitchArray.length; i++) {
			pitchDiff[i] = templatePitchArray[i] - testPitchArray[i];
			console.log("pitchDiff: " + pitchDiff[i]);
		}
	}
	if (templatePitchArray.length >= testPitchArray.length) {
		for (var i = 0; i < testPitchArray.length; i++) {
			pitchDiff[i] = templatePitchArray[i] - testPitchArray[i];
			console.log("pitchDiff: " + pitchDiff[i]);
		}
	}
	console.log("pitchDiff.length: " + pitchDiff.length);
	var total = 0;
	for(var i in pitchDiff) { total += Math.abs(pitchDiff[i]); }
	// console.log(total);
	if (total < 7000) {
		alert(JSON.stringify("MashaAllah well done! Score (less is better): " + total));
	} else {
		alert(JSON.singify("InshaAllah you'll do better next time! Score (less is better): " + total));
	}
}

function frequencyFromNoteNumber( note ) {
	return 440 * Math.pow(2,(note-69)/12);
}

function centsOffFromPitch( frequency, note ) {
	return ( 1200 * Math.log( frequency / frequencyFromNoteNumber( note ))/Math.log(2) );
}

function autoCorrelate( buf, sampleRate ) {
	var MIN_SAMPLES = 4;	// corresponds to an 11kHz signal
	var MAX_SAMPLES = 1000; // corresponds to a 44Hz signal
	var SIZE = 1000;
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;

	confidence = 0;
	currentPitch = 0;

	if (buf.length < (SIZE + MAX_SAMPLES - MIN_SAMPLES))
		return;  // Not enough data

	for (var i=0;i<SIZE;i++) {
		var val = (buf[i] - 128)/128;
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);

	for (var offset = MIN_SAMPLES; offset <= MAX_SAMPLES; offset++) {
		var correlation = 0;

		for (var i=0; i<SIZE; i++) {
			correlation += Math.abs(((buf[i] - 128)/128)-((buf[i+offset] - 128)/128));
		}
		correlation = 1 - (correlation/SIZE);
		if (correlation > best_correlation) {
			best_correlation = correlation;
			best_offset = offset;
		}
	}
	if ((rms>0.01)&&(best_correlation > 0.01)) {
		confidence = best_correlation * rms * 10000;
		currentPitch = sampleRate/best_offset;
		// console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
	}
//	var best_frequency = sampleRate/best_offset;
}

function updatePitch( time ) {
	var cycles = new Array;
	analyser.getByteTimeDomainData( buf );

	// // possible other approach to confidence: sort the array, take the median; go through the array and compute the average deviation
	// autoCorrelate( buf, audioContext.sampleRate );
	currentPitch = estimatePitchYIN(buf, audioContext.sampleRate);
	// console.log(currentPitch);
	if (currentPitch == -1) confidence = 0; // temporary just until "confidence" is eliminated from code
	else confidence = 100;

 	if (confidence <10) {
 		detectorElem.className = "vague";
	 	pitchElem.innerText = "--";
		noteElem.innerText = "-";
		detuneElem.className = "";
		detuneAmount.innerText = "--";
 	} else {
	 	detectorElem.className = "confident";
	 	pitchElem.innerText = Math.floor( currentPitch ) ;
	 	var note =  noteFromPitch( currentPitch );
		noteElem.innerHTML = noteStrings[note%12];
		var detune = centsOffFromPitch( currentPitch, note );
		if (detune == 0 ) {
			detuneElem.className = "";
			detuneAmount.innerHTML = "--";

			// TODO: draw a line.
		} else {
			if (Math.abs(detune)<10)
				canvasContext.fillStyle = "green";
			else
				canvasContext.fillStyle = "red";

			if (detune < 0) {
	  			detuneElem.className = "flat";
			}
			else {
				detuneElem.className = "sharp";
			}
  			canvasContext.fillRect(CENTER, 0, (detune*3), HEIGHT);
			detuneAmount.innerHTML = Math.abs( Math.floor( detune ) );
		}
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = window.webkitRequestAnimationFrame;
	rafID = window.requestAnimationFrame( updatePitch );
}

// TODO: this is where TimeSeries are updated
setInterval(function(){ 
	var t = new Date().getTime();
	
	if (templatePitchIndex === templatePitchArray.length) {
		templatePitchIndex = 0;
		//console.log("templatePitchIndex reset");
	}
	if (isPlaying || isLiveInput) {
		templatePitchTS.append(t, templatePitchArray[templatePitchIndex++]);
		if (confidence > 10) {
			testPitchTS.append(t, currentPitch);
			console.log(currentPitch)
		} else {
			testPitchTS.append(t, 0);
			console.log(0)
		}
	} else {
		templatePitchTS.append(t, 0);
		testPitchTS.append(t, 0);
		console.log(0)
	}
}, 25);

function createTimeline() {
    var gy_min = 0;
    var gy_max = 1000;

    var chart_gy = new SmoothieChart({millisPerPixel: 12, grid: {fillStyle: '#ffffff', strokeStyle: '#f4f4f4', sharpLines: true, millisPerLine: 5000, verticalSections: 5}, timestampFormatter: SmoothieChart.timeFormatter, minValue: gy_min, maxValue: gy_max, labels:{fillStyle:'#000000'}});

    chart_gy.addTimeSeries(testPitchTS, {lineWidth: 2, strokeStyle: 'black', fillStyle:'rgba(0, 0, 0, 0.3)'});
    chart_gy.addTimeSeries(templatePitchTS, {lineWidth: 2, strokeStyle: 'red', fillStyle:'rgba(0, 0, 0, 0.3)'});
    chart_gy.streamTo(document.getElementById("pitch-chart"));

}

function errorCallback() {
	console.log("called errorCallback()");
}


createTimeline();