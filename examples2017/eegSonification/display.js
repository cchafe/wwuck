function overlay(divId, o, param,  color) 
{
  var xy = [];
  var isTempo = false;
  if (typeof (param) !== 'number') isTempo = true;
  var range = { min: 0, max: 2 };
  if (isTempo) range = { min: 60, max: 180 };

  if (isTempo) for ( var i = 1 ; i < o.ind; i++ ) xy.push([ o["onsets"][i], o[param][i] ]); 
    else for ( var i = 1 ; i < o.ind; i++ ) xy.push([ o["onsets"][i], param ]); 
console.log(o["onsets"]);

  var dataTable = new google.visualization.DataTable();
    dataTable.addColumn('number', 'x');
    dataTable.addColumn('number', 'y');
    dataTable.addRows(xy);
  var chart;
  if (isTempo) chart = new google.visualization.LineChart(document.getElementById(divId));
    else chart = new google.visualization.ScatterChart(document.getElementById(divId));
  var chartOptions = {
    'title':'onsets and instantaneous tempo',
//          curveType: 'function',
    backgroundColor: { fill:'transparent' },
    hAxis: { viewWindow: { min: 5, max: 10 }, gridlines: { color:'transparent' },
      ticks: [5,10,15,20,25,30] },
    vAxis: { viewWindow: range, gridlines: { color:'transparent' },
      ticks: [40,80,120,160,200] },
    'width':500,
    'height':200,
    series: {
            0: {color: color,  pointShape: 'circle', pointSize: 5},
          },
    legend: 'none'
    // ,isStacked: true
    };
  chart.draw(dataTable, chartOptions);
}

/////////////////////////////////////////
function displayHistogram(divId, o, param, color, ymax) 
{
// ymax is number of items in histogram

// width of vals displayed
var xmin = 0.25;
var xmax = 1.25;

// correspond to hAxis: { viewWindow: { min: 10, max: 15 } above
var tmin = 5;
var tmax = 10;
  var x = [];
  for ( var i = 1 ; i < o.ind; i++ ) 
if((o["onsets"][i] > tmin)&&(o["onsets"][i] < tmax)) x.push([ o[param][i] ]);
  var dataTable = new google.visualization.DataTable();
  dataTable.addColumn('number', 'ioi');	// y
  dataTable.addRows(x);
  var chartOptions = { 
    title:'IOI',
    backgroundColor: { fill:'transparent' },
    histogram: { bucketSize: 0.001, maxNumBuckets: 1000, hideBucketItems:true, minValue: xmin, maxValue:xmax },
    hAxis: { type: 'category' }, // workaround for histogram bug when all data in same bin
    vAxis: { viewWindow: { min: 0.0, max: 5 } },
    legend: 'none',
    colors: [ color ],
    width:500,
    height:200};
  var chart = new google.visualization.Histogram(document.getElementById(divId));
  chart.draw(dataTable, chartOptions);
}

