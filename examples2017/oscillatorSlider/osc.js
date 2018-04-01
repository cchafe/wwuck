// osc.js

spork(runOsc)

// sonify one data point at a time
function* runOsc() {
  let sinTmp = null
  while (true) {
    let f = 10  + 50000*sliderVal/100
    let a = 0.5				// amplitude
    let dur = 0.005
    if (sinTmp == null) {		// initialize on first iteration
      sinTmp = SinOsc(this)		// patch DSP
      sinTmp.freq(f)			// set params
      sinTmp.gain(a)
      sinTmp.start()			// start DSP
      dur = 0.0				// don't wait
    }
    sinTmp.freqTarget(f,dur)		// set env targets and durs
    sinTmp.gainTarget(a,dur)
    yield dur				// wait
  }
  sinTmp.stop()
  sinTmp = null
}

