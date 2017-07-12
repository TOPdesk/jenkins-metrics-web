const theme = require('./theme');

function filterByStandardDeviation(data, standardDeviationFactor) {
  let sum = 0;
  let sumOfSquares = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i].duration;
    sumOfSquares += data[i].duration * data[i].duration;
  }
  const mean = sum / data.length;
  const variance = sumOfSquares / data.length - mean * mean;
  const standardDeviation = Math.sqrt(variance);
  const filteredData = [];
  for (let i = 0; i < data.length; i++) {
    if (mean - standardDeviationFactor * standardDeviation < data[i].duration &&
      data[i].duration < mean + standardDeviationFactor * standardDeviation) {
      filteredData.push(data[i]);
    }
  }
  return filteredData;
}

function* renderBuildTimes(res, data, title, metric) {
  const filteredData = filterByStandardDeviation(data, 3);
  const chart = {
    type: 'bar',
    data: {
      labels: filteredData.map(value => new Date(value.timestamp).toLocaleDateString()),
      datasets: [
        {
          label: 'Successful build',
          data: filteredData.map(value => (value.result === 'SUCCESS' ? value.duration : null)),
          backgroundColor: theme.buildResultToBackgroundColor('SUCCESS'),
          hoverBackgroundColor: theme.buildResultToHoverBackgroundColor('SUCCESS')
        },
        {
          label: 'Unstable build',
          data: filteredData.map(value => (value.result === 'UNSTABLE' ? value.duration : null)),
          backgroundColor: theme.buildResultToBackgroundColor('UNSTABLE'),
          hoverBackgroundColor: theme.buildResultToHoverBackgroundColor('UNSTABLE')
        }
      ]
    },
    options: {
      title: {
        text: title,
        display: true
      },
      scales: {
        xAxes: [{
          stacked: true
        }],
        yAxes: [{
          stacked: true,
          ticks: {}
        }]
      },
      maintainAspectRatio: false
    }
  };
  const templateParameters = {
    chart,
    jobName: res.params.jobName,
    metric,
    isFirefox: res.state.userAgent.isFirefox
  };
  yield res.render('templates/charts/_buildtimes', templateParameters);
}

function* renderTestResults(res, data, title, metric) {
  const chart = {
    type: 'bar',
    data: {
      labels: data.map(value => new Date(value.timestamp).toLocaleDateString()),
      datasets: [
        {
          label: 'Successful tests',
          data: data.map(value => value.successful),
          backgroundColor: theme.buildResultToBackgroundColor('SUCCESS'),
          hoverBackgroundColor: theme.buildResultToHoverBackgroundColor('SUCCESS')
        },
        {
          label: 'Failed tests',
          data: data.map(value => value.failed),
          backgroundColor: theme.buildResultToBackgroundColor('FAILURE'),
          hoverBackgroundColor: theme.buildResultToHoverBackgroundColor('FAILURE')
        },
        {
          label: 'Skipped tests',
          data: data.map(value => value.skipped),
          backgroundColor: theme.buildResultToBackgroundColor('ABORTED'),
          hoverBackgroundColor: theme.buildResultToHoverBackgroundColor('ABORTED')
        }
      ]
    },
    options: {
      title: {
        text: title,
        display: true
      },
      scales: {
        xAxes: [{
          stacked: true
        }],
        yAxes: [{
          stacked: true
        }]
      },
      maintainAspectRatio: false
    }
  };
  const templateParameters = {
    chart,
    jobName: res.params.jobName,
    metric,
    isFirefox: res.state.userAgent.isFirefox
  };
  yield res.render('templates/charts/_chart', templateParameters);
}

function* renderTestResultDistribution(res, data, title, metric) {
  const labels = ['SUCCESSFUL', 'FAILED', 'SKIPPED'];
  const chart = {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data: [data.successful, data.failed, data.skipped],
        backgroundColor: labels.map(theme.testResultToBackgroundColor),
        hoverBackgroundColor: labels.map(theme.testResultToHoverBackgroundColor)
      }]
    },
    options: {
      title: {
        display: true,
        text: title
      },
      maintainAspectRatio: true
    }
  };
  const templateParameters = {
    chart,
    jobName: res.params.jobName,
    metric
  };
  yield res.render('templates/charts/_buildresults', templateParameters);
}

function* renderBuildResults(res, data, title, metric) {
  const chart = createBuildResultPieChart(title,
    data.map(value => value.group),
    data.map(value => value.reduction));
  const templateParameters = {
    chart,
    jobName: res.params.jobName,
    metric
  };
  yield res.render('templates/charts/_buildresults', templateParameters);
}

function createBuildResultPieChart(title, labels, values) {
  return {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map(theme.buildResultToBackgroundColor),
        hoverBackgroundColor: labels.map(theme.buildResultToHoverBackgroundColor)
      }]
    },
    options: {
      title: {
        display: true,
        text: title
      },
      maintainAspectRatio: true
    }
  };
}

module.exports = {
  renderBuildTimes,
  renderBuildResults,
  renderTestResults,
  renderTestResultDistribution
};
