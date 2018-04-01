// osc.js

spork(runOsc)

// sonify one data point at a time
function* runOsc() {
  let sinTmp = null
  while (true) {
    let a = ampSlider/100		
    let f = 40000 * freqSlider/10000
    let dur = 0.021
    if (sinTmp == null) {		// initialize on first iteration
      sinTmp = FaustSinOsc(this)		// patch DSP
      sinTmp.freq(f)			// set params
      sinTmp.vol(a)
      sinTmp.start()			// start DSP
      dur = 0.0				// don't wait
    }
      sinTmp.freq(f)			// set params
      sinTmp.vol(a)			// set params
//    sinTmp.freqTarget(f,dur)		// set env targets and durs
//    sinTmp.gainTarget(a,dur)
    yield dur				// wait
  }
//  sinTmp.stop()
  sinTmp = null
}

