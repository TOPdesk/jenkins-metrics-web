const router = require('koa-router')();
const provider = require('./../../data-access/providers/testResultsProvider');
const charts = require('./../../charts/renderer');


function* getTestResultsChart(next) {
  try {
    const result = yield provider.getTestResults(this.rdbConn, this.params.jobName);
    yield charts.renderTestResults(this, result,
      'Test Results', 'testresults');
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

function* getEarliestTestResultsChart(next) {
  try {
    const result = yield provider.getEarliestTestResults(this.rdbConn, this.params.jobName);
    yield charts.renderTestResults(this, result,
      'Earliest Test Results', 'earliesttestresults');
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

function* getLatestTestResultsChart(next) {
  try {
    const result = yield provider.getLatestTestResults(this.rdbConn, this.params.jobName);
    yield charts.renderTestResults(this, result,
      'Latest Test Results', 'latesttestresults');
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

function* getTestResultsDistributionChart(next) {
  try {
    const result = yield provider.getTestResultDistribution(this.rdbConn, this.params.jobName);
    yield charts.renderTestResultDistribution(this, result,
      'Test result distribution', 'testresultdistribution');
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

function* getEarliestTestResultsDistributionChart(next) {
  try {
    const result = yield provider
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
    const result = yield provider
      .getLatestTestResultDistribution(this.rdbConn, this.params.jobName);
    yield charts.renderTestResultDistribution(this, result,
      'Latest Test result distribution', 'latesttestresultdistribution');
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

router.get('/:jobName/testresults', getTestResultsChart);
router.get('/:jobName/earliesttestresults', getEarliestTestResultsChart);
router.get('/:jobName/latesttestresults', getLatestTestResultsChart);

router.get('/:jobName/testresultdistribution', getTestResultsDistributionChart);
router.get('/:jobName/earliesttestresultdistribution', getEarliestTestResultsDistributionChart);
router.get('/:jobName/latesttestresultdistribution', getLatestTestResultsDistributionChart);

module.exports = router.routes();
