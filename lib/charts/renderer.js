const theme = require('./theme');

function* renderBuildTimes(res, data) {
  const chart = {
    type: 'bar',
    data: {
      labels: data.map(value => new Date(value.timestamp).toLocaleDateString()),
      datasets: [
        {
          label: 'Successful builds',
          data: data.map(value => (value.result === 'SUCCESS' ? value.duration : null)),
          backgroundColor: theme.buildResultToBackgroundColor('SUCCESS'),
          hoverBackgroundColor: theme.buildResultToHoverBackgroundColor('SUCCESS')
        },
        {
          label: 'Unstable builds',
          data: data.map(value => (value.result === 'UNSTABLE' ? value.duration : null)),
          backgroundColor: theme.buildResultToBackgroundColor('UNSTABLE'),
          hoverBackgroundColor: theme.buildResultToHoverBackgroundColor('UNSTABLE')
        }
      ]
    },
    options: {
      title: {
        text: 'Build times (Successful and Unstable builds)',
        display: true
      },
      scales: {
        xAxes: [{
          stacked: true
        }],
        yAxes: [{
          ticks: {}
        }]
      },
      maintainAspectRatio: false
    }
  };
  const templateParameters = {
    chart,
    jobName: res.params.jobName,
    metric: 'buildtimes'
  };
  yield res.render('templates/_buildtimes', templateParameters);
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
  yield res.render('templates/_buildresults', templateParameters);
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
  renderBuildResults
};
