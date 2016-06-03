// Hack for Firefox: it renders the full bar chart instead of animating.
// Solution is to render chart with no datasets, then later add the original datasets.
var originalDatasets = chart.data.datasets;
chart.data.datasets = [];
var chartComponent = new Chart(container, chart);
window.setTimeout(function() {
  chartComponent.data.datasets = originalDatasets;
  chartComponent.update();
}, 100);
