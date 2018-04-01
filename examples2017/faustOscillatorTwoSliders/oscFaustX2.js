// osc.js

spork(runOsc)

function* runOsc() {
  let sinFaust = null
  let sinFaust2 = null
  let dur = 1024/48000 // = 0.021
console.log(dur)
  while (true) {
    let f = 0  + 5000* Math.random() // sliderVal/100
    let db = -6 // -20  + 14*sliderVal/100	
    if (sinFaust == null) {		// initialize on first iteration
      sinFaust = FaustSinOsc(this)	// patch DSP
      sinFaust.freq(f)			// set params
      sinFaust.vol(db)			
      sinFaust.start()			// start DSP

      sinFaust2 = FaustSinOsc(this)	// patch DSP
      sinFaust2.freq(f)			// set params
      sinFaust2.vol(db)			
      sinFaust2.start()			// start DSP
      dur = 0.0				// don't wait
    }
      sinFaust.freq(f)			// set params
      sinFaust.vol(db)			 
      sinFaust2.freq(f)			// set params
      sinFaust2.vol(db)			 
    yield dur				// wait
  }
  sinFaust.stop()
  sinFaust = null
}

