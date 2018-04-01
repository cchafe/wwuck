// hw1Sonification.js
// hw1 JavaScript sonification example

// read data in, then prepare and sonify it
requestDataFile({url: "number-of-earthquakes-per-year-m.dat"})
    .then(columnOfData => {
     let data = prepare(columnOfData)
      spork(sonify,data)
    })
    .catch(error => {
        console.log(error);
    });

// prepare by determining range and normalization scale
prepare = function(stringOfNumbers) {
  let d = stringOfNumbers.split("\n")
  d.pop() // remove extra <cr> in data src
  d.pop() // remove last element in array caused by split
  let min = Math.min(...d)
  let max = Math.max(...d)
  let range = max - min
  let s = 1 / range
  let scaledVal = function (v) { return (v-min)*s }
  function* f() {
    for (let i = 0; i < d.length; i++) yield scaledVal(d[i])
    return
  }
  let iterator = f()
  return iterator
}

// sonify one data point at a time
function* sonify(data) {
  let sinTmp = null
  let datum = data.next()		// return first data object
  while (!datum.done) {
    let val = datum.value		// get its value
    let kn = 80 + val * 20		// map to a midi key num
    let f = mtof(kn) 			// convert to freq
    let a = 0.5 * Math.pow(val, 2.0)	// map to power law for amplitude
    let dur = 0.1  + .2*sliderVal/100
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
    datum = data.next()			// iterate
  }
  sinTmp.stop()
  sinTmp = null
}

