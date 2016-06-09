const router = require('koa-router')();
const charts = require('./charts/renderer');

const executionResultsProvider = require('./data-access/providers/executionResultsProvider');
const testResultsProvider = require('./data-access/providers/testResultsProvider');


function* getTestResultsChart(next) {
  try {
    const result = yield testResultsProvider
      .getTestResults(this.rdbConn, this.params.jobName);
    yield charts.renderTestResults(this, result,
      'Test Results', 'testresults');
  } catch (error) {
    yield renderError(this, 500, error);
  }
  yield next;
}

function* getEarliestTestResultsChart(next) {
  try {
    const result = yield testResultsProvider
      .getEarliestTestResults(this.rdbConn, this.params.jobName);
    yield charts.renderTestResults(this, result,
      'Earliest Test Results', 'earliesttestresults');
  } catch (error) {
    yield renderError(this, 500, error);
  }
  yield next;
}

function* getLatestTestResultsChart(next) {
  try {
    const result = yield testResultsProvider
      .getLatestTestResults(this.rdbConn, this.params.jobName);
    yield charts.renderTestResults(this, result,
      'Latest Test Results', 'latesttestresults');
  } catch (error) {
    yield renderError(this, 500, error);
  }
  yield next;
}

function* getTestResultsDistributionChart(next) {
  try {
    const result = yield testResultsProvider
      .getTestResultDistribution(this.rdbConn, this.params.jobName);
    yield charts.renderTestResultDistribution(this, result,
      'Test result distribution', 'testresultdistribution');
  } catch (error) {
    yield renderError(this, 500, error);
  }
  yield next;
}

function* getEarliestTestResultsDistributionChart(next) {
  try {
    const result = yield testResultsProvider
      .getEarliestTestResultDistribution(this.rdbConn, this.params.jobName);
    yield charts.renderTestResultDistribution(this, result,
      'Earliest Test result distribution', 'earliesttestresultdistribution');
  } catch (error) {
    yield renderError(this, 500, error);
  }
  yield next;
}

function* getLatestTestResultsDistributionChart(next) {
  try {
    const result = yield testResultsProvider
      .getLatestTestResultDistribution(this.rdbConn, this.params.jobName);
    yield charts.renderTestResultDistribution(this, result,
      'Latest Test result distribution', 'latesttestresultdistribution');
  } catch (error) {
    yield renderError(this, 500, error);
  }
  yield next;
}

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
  console.log('lasthandler:', status);
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

router.get('/:jobName/charts/testresults', getTestResultsChart);
router.get('/:jobName/charts/earliesttestresults', getEarliestTestResultsChart);
router.get('/:jobName/charts/latesttestresults', getLatestTestResultsChart);

router.get('/:jobName/charts/testresultdistribution', getTestResultsDistributionChart);
router.get('/:jobName/charts/earliesttestresultdistribution',
  getEarliestTestResultsDistributionChart);
router.get('/:jobName/charts/latesttestresultdistribution',
  getLatestTestResultsDistributionChart);

router.get('*', elseRenderError);

module.exports = router.routes();
