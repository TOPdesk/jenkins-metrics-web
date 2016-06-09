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
    yield renderError(this, 500, error);
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
    yield renderError(this, 500, error);
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
    yield renderError(this, 500, error);
  }
  yield next;
}

function* elseRenderError() {
  const status = this.status || 404;
  switch (status) {
    case 404:
      yield renderError(this, 404, { message: 'Not found' });
      break;
    case 500:
      yield renderError(this, 500, { message: 'Internal server error' });
      break;
    case 200:
    default:
      // do nothing
  }
}

function* renderError(res, status, error) {
  yield res.render('templates/_error', { status, error });
}

router.get('/:jobName/charts/buildresults', getBuildResultsChart);
router.get('/:jobName/charts/latestbuildresults', getLatestBuildResultsChart);
router.get('/:jobName/charts/earliestbuildresults', getEarliestBuildResultsChart);


router.get('*', elseRenderError);

module.exports = router.routes();
