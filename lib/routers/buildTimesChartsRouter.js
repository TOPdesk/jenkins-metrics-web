const router = require('koa-router')();
const executionTimesProvider = require('./../data-access/providers/executionTimesProvider');
const charts = require('./../charts/renderer');


function* getBuildTimesChart(next) {
  try {
    const result = yield executionTimesProvider
      .getExecutionTimes(this.rdbConn, this.params.jobName);
    yield charts.renderBuildTimes(this, result,
      'Build times (Successful and Unstable builds)', 'buildtimes');
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

function* getLatestBuildTimesChart(next) {
  try {
    const result = yield executionTimesProvider
      .getLatestExecutionTimes(this.rdbConn, this.params.jobName);
    yield charts.renderBuildTimes(this, result,
      'Latest Build times (Successful and Unstable builds)', 'latestbuildtimes');
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

function* getEarliestBuildTimesChart(next) {
  try {
    const result = yield executionTimesProvider
      .getEarliestExecutionTimes(this.rdbConn, this.params.jobName);
    yield charts.renderBuildTimes(this, result,
      'Earliest Build times (Successful and Unstable builds)', 'earliestbuildtimes');
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

router.get('/charts/:jobName/buildtimes', getBuildTimesChart);
router.get('/charts/:jobName/latestbuildtimes', getLatestBuildTimesChart);
router.get('/charts/:jobName/earliestbuildtimes', getEarliestBuildTimesChart);


module.exports = router.routes();
