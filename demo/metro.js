// define a "clip" as a function
function* metroClip(nBeeps,ioi,aDur,sDur,dDur) {
  this.nowSec = function() { return performance.now()/1000 }

  let sinTmp = SinOsc(this)
  let kn = 80
  let f = mtof(kn) 
  let a = 0.5  
  sinTmp.freq(f)
  sinTmp.gain(0)
  sinTmp.start()

//  while (true) {
  for (let i = 0; i < nBeeps; i++) {
    console.log(i,this.nowSec())
    sinTmp.gainTarget(a,aDur)
    sinTmp.freqTarget(f,aDur)
    yield aDur+sDur
    sinTmp.gainTarget(0,dDur)
    yield dDur+(ioi - (aDur+sDur+dDur))
   }
  sinTmp.stop()
  sinTmp = null
}

spork(metroClip, 5, 0.5, 0.15, 0.1, 0.05) 

