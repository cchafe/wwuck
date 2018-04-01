var cushion = 0.1 // schedule ahead 100ms
var timeIterators = []

spork = function (f, ...a) {
  let t = makeTimeIterator()
  t.event = f.apply( t, a )
  t.events("start") // timing recursion
}

makeTimeIterator = function () {
  let tmp = new TimeIterator(timeIterators.length)
  timeIterators.push(tmp)
  return tmp
}

function TimeIterator(n) {
  this.threadNum = n
  postMessage("uwta["+myWorker+"].push(new Array)") 
  this.nowSec = function() { return performance.now()/1000 }
  this.last = this.nowSec()
  this.now=0

  this.waitResolve = function (ds) {
    return new Promise(resolve => {
      setTimeout(() => {
          resolve()
        }, ds*1000)
      }
    )
  }

  this.events = async function (ds) {
    await this.waitResolve(ds)
    let elapsed = (this.nowSec() - this.last)
    this.last = this.nowSec()
    let jitter = 0
    if (ds === "start") {
    } else {
      jitter = elapsed-ds
      postMessage("jitometer.value = (50 +"+jitter+"*10000)")
    }
    ds = this.event.next().value
    this.now+=ds // logical time
//console.log("this.now =",this.now,"ds =",ds)
    this.events(ds-jitter)
  }

  this.dspCnt = 0
  this.dsp = function () {
    let dspNext = this.dspCnt
    this.dspCnt++
    return dspNext
  }
}

SinOsc = function (myThread) {
  let ugens = "uwta["+myWorker+"]["+myThread.threadNum+"]"
  postMessage(ugens+".push(makeSinOsc())") 
  return { dsp:myThread.dsp(), now:myThread.now+cushion,
    freq: function (hz) {
        let n = this.dsp
        postMessage(ugens+"["+n+"].osc.frequency.setValueAtTime("+hz+", "+(myThread.now+cushion)+")")
      },
    freqTarget: function (hz,dur) {
        let n = this.dsp
        postMessage(ugens+"["+n+"].osc.frequency.linearRampToValueAtTime("+hz+", "+((myThread.now+cushion)+dur)+")")
      },
    gain: function (amp) {
        let n = this.dsp
        postMessage(ugens+"["+n+"].gain.gain.setValueAtTime("+amp+", "+(myThread.now+cushion)+")")
      },
    gainTarget: function (amp,dur) {
        let n = this.dsp
        postMessage(ugens+"["+n+"].gain.gain.linearRampToValueAtTime("+amp+", "+((myThread.now+cushion)+dur)+")")
      },
    start: function () {
      let n = this.dsp;
      postMessage(ugens+"["+n+"].osc.start("+(myThread.now+cushion)+")")
    },
    stop: function () {
      let n = this.dsp;
      postMessage(ugens+"["+n+"].osc.stop("+(myThread.now+cushion)+")")
      postMessage(ugens+"["+n+"].osc.disconnect()")
    }
  }
}

FM = function (myThread) {
  let ugens = "uwta["+myWorker+"]["+myThread.threadNum+"]"
  postMessage(ugens+".push(makeFM())") 
  return { dsp:myThread.dsp(), now:myThread.now+cushion,
    freq: function (hz) {
        let n = this.dsp
        postMessage(ugens+"["+n+"].osc.frequency.setValueAtTime("+hz+", "+(myThread.now+cushion)+")")
      },
    freqTarget: function (hz,dur) {
        let n = this.dsp
        postMessage(ugens+"["+n+"].osc.frequency.linearRampToValueAtTime("+hz+", "+((myThread.now+cushion)+dur)+")")
      },
    gain: function (amp) {
        let n = this.dsp
        postMessage(ugens+"["+n+"].gain.gain.setValueAtTime("+amp+", "+(myThread.now+cushion)+")")
      },
    gainTarget: function (amp,dur) {
        let n = this.dsp
        postMessage(ugens+"["+n+"].gain.gain.linearRampToValueAtTime("+amp+", "+((myThread.now+cushion)+dur)+")")
      },
    indexTarget: function (ind,dur) {
//console.log(ind)
        let n = this.dsp
        postMessage(ugens+"["+n+"].modOut.gain.linearRampToValueAtTime("+ind+", "+((myThread.now+cushion)+dur)+")")
      },
    start: function () {
      let n = this.dsp;
      postMessage(ugens+"["+n+"].osc.start("+(myThread.now+cushion)+")")
    },
    stop: function () {
      let n = this.dsp;
      postMessage(ugens+"["+n+"].osc.stop("+(myThread.now+cushion)+")")
      postMessage(ugens+"["+n+"].osc.disconnect()")
    }
  }
}

onmessage = function(e) {
  let geval = eval // equivalent to calling eval in the global scope
  geval(e.data)
}

// XMLHttpRequest wrapper using callbacks
let requestDataFile = obj => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(obj.method || "GET", obj.url);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send(obj.body);
    });
};

////////////////
// utilities from https://github.com/hoch/WAAX/
mtof = function (midi) { // altered for floating pt midi vals by CC
  if (midi <= -1500) return 0;
  else if (midi > 1499) return 3.282417553401589e+38;
  else return 440.0 * Math.pow(2, (midi - 69) / 12.0);
};

lintodb = function (lin) {
  // if below -100dB, set to -100dB to prevent taking log of zero
  return 20.0 * (lin > 0.00001 ? (Math.log(lin) / Math.LN10) : -5.0);
};

dbtolin = function (db) {
  return Math.pow(10.0, db / 20.0);
};


