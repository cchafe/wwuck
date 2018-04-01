// webAudio220a.js
// loaded after .html body with   <script src="webAudio220a.js"></script>
// spawns workerThreads defined in worker220a.js


labelSlider = function (slider, sliderTicks,name,minVal,maxVal,curVal,steps) {
  let s = document.getElementById(slider);
  let children = document.getElementById(sliderTicks).children;
  let parent = s.parentNode;
  let helper = document.createElement("div")
  helper.style.position = "relative"
  helper.style.left = "4px"
  helper.style.top = "16px"
  helper.innerHTML = name
  parent.appendChild(helper)
  let range = maxVal - minVal
  let stepsPerTick = Math.round(100/(children.length-1))
  for(var i = 0; i < children.length; i++) {
    let child = children[i];
    if(i%5===0) {
      let helper = document.createElement("div")
      helper.style.position = "relative"
      helper.style.left = "-4px"
      helper.style.top = "12px"
      helper.innerHTML = minVal + i*range/stepsPerTick
      child.appendChild(helper);
    }
  }
  s.value = (curVal-minVal)/range * steps // reset on load
}
labelSlider("ampSlider","ampTicks","amp",0,1,0.05,100)
labelSlider("freqSlider","freqTicks","freq",0,40000,1000,10000)

ampSlider.oninput = function() {
  for (let i = 0; i < workerThreads.length; i++) 
    workerThreads[i].worker.postMessage("ampSlider = "+this.value)
}

freqSlider.oninput = function() {
  for (let i = 0; i < workerThreads.length; i++) 
    workerThreads[i].worker.postMessage("freqSlider = "+this.value)
}

var goButton = document.getElementById("go")
var stopButton = document.getElementById("stop")
stopButton.setAttribute('disabled','disabled')
cushion.value = 20 // reset on load

cushion.oninput = function() {
  let c = cushion.value/20 * 100
  msCushion.innerHTML = Math.round(c)
  for (let i = 0; i < workerThreads.length; i++) 
    workerThreads[i].worker.postMessage("cushion = "+c/1000)
}

var nWorkers = 1
var audioCtx 
var workerThreads = []
var uwta = [] // ugenWorkerThreadsArrays
cushion.oninput()

makeWorkerThread = function () {
  let tmp = new WorkerThread(workerThreads.length, "worker220a.js")
  workerThreads.push(tmp)
}

goButton.onclick = function() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)()
console.log("sample rate = ",audioCtx.sampleRate)
  for (let i = 0; i < nWorkers; i++)  makeWorkerThread()
  cushion.oninput()
  ampSlider.oninput() 
  freqSlider.oninput() 
  for (let i = 0; i < workerThreads.length; i++) workerThreads[i].go()
  stopButton.removeAttribute('disabled')
  goButton.setAttribute('disabled','disabled')
}

stopButton.onclick = function() {
  for (let i = 0; i < workerThreads.length; i++) workerThreads[i].stop()
//  console.log("terminate Message posted to workerThreads")
  audioCtx.close().then( function() {
      workerThreads = []
      uwta = []
      goButton.removeAttribute('disabled')
      stopButton.setAttribute('disabled','disabled')
    }
  )
}

function WorkerThread(n,src) {
  this.threadNum = n
  this.src = src
  this.worker = new Worker(this.src)
  uwta.push(new Array)
  this.worker.postMessage("myWorker = "+this.threadNum)
  this.worker.onmessage = function(e) { eval(e.data) }
  this.go = function() {
    this.worker.postMessage("importScripts(\""+goButton.value+".js\")")
  }
  this.stop = function() {
    this.worker.terminate()
//    console.log("terminate Message posted to WorkerThread")
  }
}

function FaustConfig() {
  this.dsp
  this.dspSrc
  this.dspName
  this.initDSP = function (s,n) { // dsp.initDSP("osc.js","osc")
    this.dspSrc = s
    this.dspName = n
    this.closeDSP()
    this.dsp = faust.osc(audioCtx, 512)
    return (this)
  }
  this.closeDSP = function () {
    this.dsp = null
  }
  this.dspSet = function (p, v) {
    this.dsp.setParamValue("/"+this.dspName+"/" + p, v)
  }
}
function makeFaustSinOsc()
{
//  faustConfig.dspSet("freq", 440)
//  faustConfig.dspSet("vol", 440)
  let dsp = new FaustConfig()
  let o = faust.osc(audioCtx, 1024)
  o.setParamValue("/"+"Oscillator"+"/" + "freq", 2500.0)
  return { osc:o }
}

function makeSinOsc()
{
  let o = audioCtx.createOscillator()
  let g = audioCtx.createGain()
  o.type = "sine"
  o.frequency.value = 440
  g.gain.value = 0.1
  o.connect(g)
  g.connect(audioCtx.destination)
  return { osc:o, gain:g }
}


function FM(context) {
/*
amp 			= hslider("volume", 0.5, 0.0, 1.0, 0.01) : si.smoo ;
cFreq 			= hslider("cFreq [unit:Hz]", 1000, 20, 10000, 1) : si.smoo ;
index 			= hslider("index", 1.0, 0.0, 22.0, 0.01) : si.smoo ;
mRatio 			= hslider("mRatio", 1.0, 0.0, 100.0, 0.001)  *0.01: si.smoo ;

modGain = cFreq * index;
modFreq = cFreq * mRatio;
mod = os.osc(modFreq) * modGain;
out = os.osc(cFreq + mod) * amp;
*/


    this.modOut = context.createGain();
    this.mod = context.createOscillator();
    this.mod.connect(this.modOut);
    this.mod.type = "sine";
    this.mod.start(0);

    this.car = context.createOscillator();
    this.car.type = "sine";
    this.car.start(0);
    this.modOut.connect(this.car.frequency);

  let cFreq = 1200
  let index = 33
  let mRatio = .1
// need to do this with external targets, these are only inits
  let modGain = cFreq * index
  let modFreq = cFreq * mRatio

  this.modOut.gain.value = modGain
  this.mod.frequency.value = modFreq
  this.car.frequency.value = cFreq
}

function makeFM()
{
  let modOut = audioCtx.createGain()
  let mod = audioCtx.createOscillator()
  mod.connect(modOut)
  mod.type = "sine"
  mod.start(0)

  let car = audioCtx.createOscillator()
  car.type = "sine"
  //  car.start(0);
  modOut.connect(car.frequency)
  let g = audioCtx.createGain()

  g.gain.value = 0.1
  car.connect(g)
  g.connect(audioCtx.destination)
//////////////////
  let cFreq = 2200
  let index = 33
  let mRatio = .1
  let modGain = cFreq * index
  let modFreq = cFreq * mRatio
  modOut.gain.value = modGain
  mod.frequency.value = modFreq
  car.frequency.value = cFreq

  return { osc:car, gain:g, modOut:modOut, mod:mod }
}


