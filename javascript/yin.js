/*
 Estimates pitch in inputBuffer using YIN algorithm. 
 See http://recherche.ircam.fr/equipes/pcm/cheveign/ps/2002_JASA_YIN_proof.pdf
 
 RETURN: pitch in Hz
*/
function estimatePitchYIN(inputBuffer, sampleRate, confidence) {
	var THRESHOLD = 0.15;

	var tauEstimate = -1;
	var pitchInHertz = -1;
	var bufferSize = inputBuffer.length;
	if (bufferSize % 2 === 1) bufferSize--;
	var overlapSize = bufferSize/2;
	var yinBuffer = new Array();

	confidence = 100;
	return 30; 
}

/*
 Implements the difference function as described
 in step 2 of the YIN paper
*/
function YIN_difference(inputBuffer, yinBuffer) {
	var j, tau, delta;
	for (tau = 0; tau < yinBuffer.length; tau++) {
		yinBuffer[tau] = 0;
	}
	for(tau = 1 ; tau < yinBuffer.length ; tau++){
		for(j = 0 ; j < yinBuffer.length ; j++){
			delta = inputBuffer[j] - inputBuffer[j+tau];
			yinBuffer[tau] += delta * delta;
		}
	}
}

/*
 The cumulative mean normalized difference function
 as described in step 3 of the YIN paper
 
 yinBuffer[0] == yinBuffer[1] = 1
*/
function YIN_cumulativeMeanNormalizedDifference(yinBuffer) {
	var tau;
	yinBuffer[0] = 1;
	//Very small optimization in comparison with AUBIO
	//start the running sum with the correct value:
	//the first value of the yinBuffer
	var runningSum = yinBuffer[1];
	//yinBuffer[1] is always 1
	yinBuffer[1] = 1;
	//now start at tau = 2
	for(tau = 2 ; tau < yinBuffer.length ; tau++){
		runningSum += yinBuffer[tau];
		yinBuffer[tau] *= tau / runningSum;
	}
}

/**
 Implements step 4 of the YIN paper

 RETURN: tau estimate if pitch found. If no pitch found, return -1.
 */
function YIN_absoluteThreshold(yinBuffer, threshold) {
	//Uses another loop construct
	//than the AUBIO implementation
	var tau;
	for(tau = 1; tau < yinBuffer.length; tau++) {
		if(yinBuffer[tau] < threshold) {
			while(tau+1 < yinBuffer.length &&
					yinBuffer[tau+1] < yinBuffer[tau])
				tau++;
			return tau;
		}
	}
	//no pitch found
	return -1;
}

/**
 Implements step 5 of the YIN paper. It refines the estimated tau value
 using parabolic interpolation. This is needed to detect higher
 frequencies more precisely.
 
 Parameters:
 	- tauEstimate: the estimated tau value.
 
 RETURN: a better, more precise tau value.
 */
function YIN_parabolicInterpolation(tauEstimate) {
	var s0, s1, s2;
	var x0 = (tauEstimate < 1) ? tauEstimate : tauEstimate - 1;
	var x2 = (tauEstimate + 1 < yinBuffer.length) ? tauEstimate + 1 : tauEstimate;
	if (x0 === tauEstimate)
		return (yinBuffer[tauEstimate] <= yinBuffer[x2]) ? tauEstimate : x2;
	if (x2 === tauEstimate)
		return (yinBuffer[tauEstimate] <= yinBuffer[x0]) ? tauEstimate : x0;
	s0 = yinBuffer[x0];
	s1 = yinBuffer[tauEstimate];
	s2 = yinBuffer[x2];
	//fixed AUBIO implementation, thanks to Karl Helgason:
	//(2.0f * s1 - s2 - s0) was incorrectly multiplied with -1
	return tauEstimate + 0.5f * (s2 - s0 ) / (2.0f * s1 - s2 - s0);
}

//TODO: finish estimatePitchYIN to utilize "private" functions above and return pitch value
