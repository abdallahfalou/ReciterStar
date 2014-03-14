console.log("Hello, reciterstar.js");
window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var isPlaying = false;
var sourceNode = null;
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

var templatePitchIndex = 0;
var templatePitchArray = [65,69,94,94,94,93,93,93,93,93,93,93,93,93,93,93,150,150,150,150,150,150,150,150,150,150,150,150,150,150,150,150,85,86,74,86,86,62,58,86,86,74,58,86,86,86,66,67,86,74,86,86,86,150,67,67,85,85,150,150,150,150,150,150,150,150,150,150,150,92,150,93,69,74,65,81,81,59,81,81,81,81,81,81,74,81,81,74,57,59,65,93,150,150,150,150,150,150,86,86,86,86,86,86,67,74,86,74,86,67,86,62,86,86,86,86,86,86,86,86,74,58,86,85,150,150,150,150,150,150,92,92,92,92,92,92,93,92,93,93,65,93,65,57,69,93,74,93,93,93,93,93,93,150,150,150,150,150,150,150,86,87,87,56,87,87,87,150,150,150,87,68,87,87,63,87,87,87,87,87,87,56,63,150,150,74];
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

//request.open("GET", "./media/Fatiha.mp4", true);
request.open("GET", "./media/Whistle.mp3", true);
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

function gotStream(stream) {
    // Create an AudioNode from the stream.
    var mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Connect it to the destination.
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    mediaStreamSource.connect( analyser );
    updatePitch();
}

function toggleLiveInput() {
    getUserMedia({audio:true}, gotStream);
}


function togglePlayback() {
    var now = audioContext.currentTime;

    if (isPlaying) {
        //stop playing and return
        sourceNode.stop( now );
        sourceNode = null;
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

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = theBuffer;
    sourceNode.loop = true;

    analyser = audioContext.createAnalyser();
	  		v.play()
    analyser.fftSize = 2048;
    sourceNode.connect( analyser );
    analyser.connect( audioContext.destination );
    sourceNode.start( now );
    isPlaying = true;
    isLiveInput = false;
    updatePitch();

    return "stop";
}

var rafID = null;
var tracks = null;
var buflen = 2048;
var buf = new Uint8Array( buflen );
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
	currentPitch = estimatePitchYIN(buf, audioContext.sampleRate, confidence);
	confidence = 11; // temporary just to be over threshold and test estimatePitchYIN()

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
		console.log("templatePitchIndex reset");
	}
	if (isPlaying) {
		templatePitchTS.append(t, templatePitchArray[templatePitchIndex++]);
	} else {
		templatePitchTS.append(t, 0);
	}
	if (confidence > 10) {
		testPitchTS.append(t, currentPitch);
	} else {
		testPitchTS.append(t, 0);
	}
}, 25);

function createTimeline() {
    var gy_min = 0;
    var gy_max = 200;

    var chart_gy = new SmoothieChart({millisPerPixel: 12, grid: {fillStyle: '#ffffff', strokeStyle: '#f4f4f4', sharpLines: true, millisPerLine: 5000, verticalSections: 5}, timestampFormatter: SmoothieChart.timeFormatter, minValue: gy_min, maxValue: gy_max, labels:{fillStyle:'#000000'}});

    chart_gy.addTimeSeries(testPitchTS, {lineWidth: 2, strokeStyle: 'black', fillStyle:'rgba(0, 0, 0, 0.3)'});
    chart_gy.addTimeSeries(templatePitchTS, {lineWidth: 2, strokeStyle: 'red', fillStyle:'rgba(0, 0, 0, 0.3)'});
    chart_gy.streamTo(document.getElementById("pitch-chart"));

}

function errorCallback() {
	console.log("called errorCallback()");
}


createTimeline();