const router = require('koa-router')();
const provider = require('../../data-access/providers/executionTimesProvider');

function* getBuildTimesMetrics(next) {
  try {
    const averages = yield provider
      .getExecutionTimeAverages(this.rdbConn, this.params.jobName);
    const overall = averages.overall;
    const earliest = averages.earliest;
    const latest = averages.latest;
    yield this.render('templates/metrics/_buildtimes', { overall, earliest, latest });
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

router.get('/:jobName/buildtimes', getBuildTimesMetrics);


module.exports = router.routes();
