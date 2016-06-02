const theme = require('./theme');

function* renderBuildTimes(res, data) {
  const chart = {
    type: 'bar',
    data: {
      labels: data.map(value => new Date(value.timestamp).toLocaleDateString()),
      datasets: [{
        label: 'Build times (Successful and Unstable builds)',
        data: data.map(value => value.duration)
      }]
    },
    options: {
      scales: {
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
  const chart = {
    type: 'pie',
    data: {
      labels: data.map(value => value.group),
      datasets: [{
        data: data.map(value => value.reduction),
        backgroundColor: data.map(theme.buildResultToBackgroundColor),
        hoverBackgroundColor: data.map(theme.buildResultToHoverBackgroundColor)
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
