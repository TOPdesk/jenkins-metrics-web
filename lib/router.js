const router = require('koa-router')();
const provider = require('./data-access/dataProvider');
const config = require('config');
const charts = require('./charts');

function* getJobs(next) {
  try {
    const result = yield provider.getJobs(this.rdbConn);
    yield this.render('index', { jobs: result });
  } catch (error) {
    this.status = 500;
    this.body = error.message;
  }
  yield next;
}

function* getJob(next) {
  try {
    const result = yield provider.getBuilds(this.rdbConn, this.params.jobName);
    yield this.render('_job', {
      name: this.params.jobName,
      builds: result,
      statistics: config.get('statistics')
    });
  } catch (error) {
    this.status = 500;
    this.body = error.message;
  }
  yield next;
}

function* getBuildTimesChart(next) {
  try {
    const result = yield provider.getExecutionTimes(this.rdbConn, this.params.jobName);
    yield charts.renderBuildTimes(this, result);
  } catch (error) {
    this.status = 500;
    this.body = error.message;
  }
  yield next;
}

function * getBuildResultsChart(next) {
  try {
    const result = yield provider.getExecutionResults(this.rdbConn, this.params.jobName);
    yield charts.renderBuildResults(this, result);
  } catch (error) {
    this.status = 500;
    this.body = error.message;
  }
  yield next;
}

router.get('/', getJobs);
router.get('/:jobName', getJob);
router.get('/:jobName/charts/buildtimes', getBuildTimesChart);
router.get('/:jobName/charts/buildresults', getBuildResultsChart);

module.exports = router.routes();
