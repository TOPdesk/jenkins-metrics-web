const router = require('koa-router')();
const charts = require('./../../charts/renderer');
const provider = require('./../../data-access/providers/executionResultsProvider');

function * getBuildResultsChart(next) {
  try {
    const result = yield provider.getExecutionResults(this.rdbConn, this.params.jobName);
    yield charts.renderBuildResults(this, result,
      'Build result distribution (All builds)', 'buildresults');
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

function * getLatestBuildResultsChart(next) {
  try {
    const result = yield provider.getLatestExecutionResults(this.rdbConn, this.params.jobName);
    yield charts.renderBuildResults(this, result,
      'Build result distribution (Latest Builds)', 'latestbuildresults');
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

function * getEarliestBuildResultsChart(next) {
  try {
    const result = yield provider.getEarliestExecutionResults(this.rdbConn, this.params.jobName);
    yield charts.renderBuildResults(this, result,
      'Build result distribution (Earliest Builds)', 'earliestbuildresults');
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

router.get('/:jobName/buildresults', getBuildResultsChart);
router.get('/:jobName/latestbuildresults', getLatestBuildResultsChart);
router.get('/:jobName/earliestbuildresults', getEarliestBuildResultsChart);


module.exports = router.routes();
