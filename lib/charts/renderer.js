const theme = require('./theme');

function* renderBuildTimes(res, data) {
  const chart = {
    type: 'bar',
    data: {
      labels: data.map(value => new Date(value.timestamp).toLocaleDateString()),
      datasets: [
        {
          label: 'Build times (Successful builds)',
          data: data.map(value => (value.result === 'SUCCESS' ? value.duration : null)),
          backgroundColor: theme.buildResultToBackgroundColor('SUCCESS'),
          hoverBackgroundColor: theme.buildResultToHoverBackgroundColor('SUCCESS')
        },
        {
          label: 'Build times (Unstable builds)',
          data: data.map(value => (value.result === 'UNSTABLE' ? value.duration : null)),
          backgroundColor: theme.buildResultToBackgroundColor('UNSTABLE'),
          hoverBackgroundColor: theme.buildResultToHoverBackgroundColor('UNSTABLE')
        }
      ]
    },
    options: {
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

function* renderBuildResults(res, data) {
  const valueToGroup = value => value.group;
  const chart = {
    type: 'pie',
    data: {
      labels: data.map(valueToGroup),
      datasets: [{
        data: data.map(value => value.reduction),
        backgroundColor: data.map(valueToGroup).map(theme.buildResultToBackgroundColor),
        hoverBackgroundColor: data.map(valueToGroup).map(theme.buildResultToHoverBackgroundColor)
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Build result distribution (All builds)'
      },
      maintainAspectRatio: true
    }
  };
  const templateParameters = {
    chart,
    jobName: res.params.jobName,
    metric: 'buildresults'
  };
  yield res.render('templates/_buildresults', templateParameters);
}

module.exports = {
  renderBuildTimes,
  renderBuildResults
};
