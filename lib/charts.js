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


module.exports = {
  renderBuildTimes
};
