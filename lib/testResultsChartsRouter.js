const router = require('koa-router')();
const testResultsProvider = require('./data-access/providers/testResultsProvider');
const charts = require('./charts/renderer');


function* getTestResultsChart(next) {
  try {
    const result = yield testResultsProvider
      .getTestResults(this.rdbConn, this.params.jobName);
    yield charts.renderTestResults(this, result,
      'Test Results', 'testresults');
  } catch (error) {
    this.status = 500;
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
    this.status = 500;
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
    this.status = 500;
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
    this.status = 500;
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
    this.status = 500;
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
    this.status = 500;
  }
  yield next;
}

router.get('/:jobName/charts/testresults', getTestResultsChart);
router.get('/:jobName/charts/earliesttestresults', getEarliestTestResultsChart);
router.get('/:jobName/charts/latesttestresults', getLatestTestResultsChart);

router.get('/:jobName/charts/testresultdistribution', getTestResultsDistributionChart);
router.get('/:jobName/charts/earliesttestresultdistribution',
  getEarliestTestResultsDistributionChart);
router.get('/:jobName/charts/latesttestresultdistribution',
  getLatestTestResultsDistributionChart);

module.exports = router.routes();
