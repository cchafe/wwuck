// osc.js

spork(runOsc)

dbtolin = function (db) {
  return Math.pow(10.0, db / 20.0);
};

function* runOsc() {
  let sinFaust = null
  let sinNode = null
  while (true) {
    let f = 10  + 5000*sliderVal/100
    let db = -96  + 96*sliderVal/100	
    let dur = 0.01
    if (sinFaust == null) {		// initialize on first iteration
      sinNode = SinOsc(this)		// patch DSP
      sinNode.freq(f)			// set params
      sinNode.gain(dbtolin(db))
      sinNode.start()			// start DSP

      sinFaust = FaustSinOsc(this)	// patch DSP
      sinFaust.freq(f)			// set params
      sinFaust.vol(db)			
      sinFaust.start()			// start DSP
      dur = 0.0				// don't wait
    }
      sinNode.freqTarget(f,dur)		// set env targets and durs
      sinNode.gainTarget(dbtolin(db),dur)
      sinFaust.freq(f)			// set params
      sinFaust.vol(db)			 
    yield dur				// wait
  }
  sinFaust.stop()
  sinFaust = null
}

