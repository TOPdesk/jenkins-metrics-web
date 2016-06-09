const router = require('koa-router')();
const testResultsProvider = require('./../data-access/providers/testResultsProvider');
const charts = require('./../charts/renderer');


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

router.get('/charts/:jobName/testresults', getTestResultsChart);
router.get('/charts/:jobName/earliesttestresults', getEarliestTestResultsChart);
router.get('/charts/:jobName/latesttestresults', getLatestTestResultsChart);

router.get('/charts/:jobName/testresultdistribution', getTestResultsDistributionChart);
router.get('/charts/:jobName/earliesttestresultdistribution',
  getEarliestTestResultsDistributionChart);
router.get('/charts/:jobName/latesttestresultdistribution',
  getLatestTestResultsDistributionChart);

module.exports = router.routes();
