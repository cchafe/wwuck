// webAudio220a.js
// loaded after .html body with   <script src="webAudio220a.js"></script>
// spawns workerThreads defined in worker220a.js

var goButton = document.getElementById("go")
var stopButton = document.getElementById("stop")
stopButton.setAttribute('disabled','disabled')
//var slider = document.getElementById("slider")
slider.value = 50 // reset on load
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
  for (let i = 0; i < nWorkers; i++)  makeWorkerThread()
  cushion.oninput()
  slider.oninput() 
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

slider.oninput = function() {
  for (let i = 0; i < workerThreads.length; i++) 
    workerThreads[i].worker.postMessage("sliderVal = "+this.value)
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


