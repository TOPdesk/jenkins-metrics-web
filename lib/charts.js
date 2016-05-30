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
        data: data.map(value => value.reduction)
      }]
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
