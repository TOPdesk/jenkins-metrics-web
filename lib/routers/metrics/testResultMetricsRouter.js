const router = require('koa-router')();
const provider = require('../../data-access/providers/testResultsProvider');

function* getTestResultsMetrics(next) {
  try {
    const overall = yield provider.getTestResultMetrics(this.rdbConn, this.params.jobName);
    const earliest = yield provider.getEarliestTestResultMetrics(this.rdbConn, this.params.jobName);
    const latest = yield provider.getLatestTestResultMetrics(this.rdbConn, this.params.jobName);
    yield this.render('templates/metrics/_testresults', { overall, earliest, latest });
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

router.get('/:jobName/testresults', getTestResultsMetrics);


module.exports = router.routes();
