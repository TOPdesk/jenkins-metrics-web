const router = require('koa-router')();
const charts = require('./charts/renderer');
const executionResultsProvider = require('./data-access/providers/executionResultsProvider');

function * getBuildResultsChart(next) {
  try {
    const result = yield executionResultsProvider
      .getExecutionResults(this.rdbConn, this.params.jobName);
    yield charts.renderBuildResults(this, result,
      'Build result distribution (All builds)', 'buildresults');
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

function * getLatestBuildResultsChart(next) {
  try {
    const result = yield executionResultsProvider
      .getLatestExecutionResults(this.rdbConn, this.params.jobName);
    yield charts.renderBuildResults(this, result,
      'Build result distribution (Latest Builds)', 'latestbuildresults');
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

function * getEarliestBuildResultsChart(next) {
  try {
    const result = yield executionResultsProvider
      .getEarliestExecutionResults(this.rdbConn, this.params.jobName);
    yield charts.renderBuildResults(this, result,
      'Build result distribution (Earliest Builds)', 'earliestbuildresults');
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

router.get('/:jobName/charts/buildresults', getBuildResultsChart);
router.get('/:jobName/charts/latestbuildresults', getLatestBuildResultsChart);
router.get('/:jobName/charts/earliestbuildresults', getEarliestBuildResultsChart);


module.exports = router.routes();
