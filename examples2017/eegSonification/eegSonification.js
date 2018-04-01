// hw1Sonification.js
// hw1 JavaScript sonification example

// read data in, then prepare and sonify it
requestDataFile({url: "eeg.dat"})
    .then(columnOfData => {
      let data1 = prepare(columnOfData)
      let data2 = prepare(columnOfData) // copy
      spork(graph,data1)
      spork(sonify,data2)
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

// graph one data point at a time
function* graph(data) {
  let graphTmp = null
  let datum = data.next()		// return first data object
//  while (!datum.done) {
  for (let i = 0; i < 2000; i++) {
    let val = datum.value		// get its value
    let dur = 0.0
    if (graphTmp == null) {		// initialize on first iteration
      graphTmp = Graph(this)		// patch DSP
      graphTmp.val(i,val)			// set params
      dur = 0.0				// don't wait
    }
      graphTmp.val(i,val)			// set params
//    yield dur				// wait
    datum = data.next()			// iterate
  }
  graphTmp.plot()
//  graphTmp.stop()
  graphTmp = null
}

// sonify one data point at a time
function* sonify(data) {
  let sinTmp = null
  let datum = data.next()		// return first data object
  while (!datum.done) {
    let val = datum.value		// get its value
    let kn = 60 + val * 20		// map to a midi key num
    let f = mtof(kn) 			// convert to freq
    let a = 0.75 * Math.pow(val, 2.0)	// map to power law for amplitude
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
    datum = data.next()			// iterate
  }
  sinTmp.stop()
  sinTmp = null
}

/////////////////////////////////////////

function overlay(divId, data,  color) 
{
  let xy = [];
  let datum = data.next()		// return first data object
  while (!datum.done) {
    let val = datum.value		// get its value
    xy.push(val)
    datum = data.next()			// iterate
  }
//  let dataTable = new google.visualization.DataTable();
 console.log(window.dataTable)
    window.dataTable.addColumn('number', 'x');
    window.dataTable.addColumn('number', 'y');
    window.dataTable.addRows(xy);
//  let chart;
//  chart = new google.visualization.ScatterChart(document.getElementById(divId));
  let chartOptions = {
    'title':'xxx',
//          curveType: 'function',
    backgroundColor: { fill:'transparent' },
    hAxis: { viewWindow: { min: 0, max: 10 }, gridlines: { color:'transparent' },
      ticks: [5,10,15,20,25,30] },
    vAxis: { viewWindow: range, gridlines: { color:'transparent' },
      ticks: [0,1] },
    'width':500,
    'height':200,
    series: {
            0: {color: color,  pointShape: 'circle', pointSize: 5},
          },
    legend: 'none'
    // ,isStacked: true
    };
  window.chart.draw(window.dataTable, chartOptions);
}

