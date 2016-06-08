const router = require('koa-router')();
const provider = require('./data-access/dataProvider');
const charts = require('./charts/renderer');
const packageJson = require('../package.json');


function* getJobs(next) {
  try {
    const result = yield provider.getJobs(this.rdbConn);
    yield this.render('index', { jobs: result, package: packageJson });
  } catch (error) {
    renderError(this, 500, error);
  }
  yield next;
}

function* getJob(next) {
  try {
    if (yield provider.isJobAvailable(this.rdbConn, this.params.jobName)) {
      yield this.render('templates/jobs/_default_job_page', {
        name: this.params.jobName,
        page: 'default'
      });
    } else {
      yield renderError(this, 404, { error: { message: 'Not Found' } });
    }
  } catch (error) {
    yield renderError(this, 500, error);
  }
  yield next;
}

function* getJobTestsPage(next) {
  try {
    if (yield provider.isJobAvailable(this.rdbConn, this.params.jobName)) {
      yield this.render('templates/jobs/_tests_job_page', {
        name: this.params.jobName,
        page: 'tests'
      });
    } else {
      yield renderError(this, 404, { error: { message: 'Not Found' } });
    }
  } catch (error) {
    yield renderError(this, 500, error);
  }
  yield next;
}

function* getBuildTimesChart(next) {
  try {
    const result = yield provider.getExecutionTimes(this.rdbConn, this.params.jobName);
    yield charts.renderBuildTimes(this, result,
      'Build times (Successful and Unstable builds)', 'buildtimes');
  } catch (error) {
    yield renderError(this, 500, error);
  }
  yield next;
}

function* getTestResultsChart(next) {
  try {
    const result = yield provider.getTestResults(this.rdbConn, this.params.jobName);
    yield charts.renderTestResults(this, result,
      'Test Results', 'testresults');
  } catch (error) {
    yield renderError(this, 500, error);
  }
  yield next;
}

function* getEarliestTestResultsChart(next) {
  try {
    const result = yield provider.getEarliestTestResults(this.rdbConn, this.params.jobName);
    yield charts.renderTestResults(this, result,
      'Earliest Test Results', 'earliesttestresults');
  } catch (error) {
    yield renderError(this, 500, error);
  }
  yield next;
}

function* getLatestTestResultsChart(next) {
  try {
    const result = yield provider.getLatestTestResults(this.rdbConn, this.params.jobName);
    yield charts.renderTestResults(this, result,
      'Latest Test Results', 'latesttestresults');
  } catch (error) {
    yield renderError(this, 500, error);
  }
  yield next;
}

function* getTestResultsDistributionChart(next) {
  try {
    const result = yield provider.getTestResultDistribution(this.rdbConn, this.params.jobName);
    yield charts.renderTestResultDistribution(this, result,
      'Test result distribution', 'testresultdistribution');
  } catch (error) {
    yield renderError(this, 500, error);
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
    yield renderError(this, 500, error);
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
    yield renderError(this, 500, error);
  }
  yield next;
}

function* getLatestBuildTimesChart(next) {
  try {
    const result = yield provider.getLatestExecutionTimes(this.rdbConn, this.params.jobName);
    yield charts.renderBuildTimes(this, result,
      'Latest Build times (Successful and Unstable builds)', 'latestbuildtimes');
  } catch (error) {
    yield renderError(this, 500, error);
  }
  yield next;
}

function* getEarliestBuildTimesChart(next) {
  try {
    const result = yield provider.getEarliestExecutionTimes(this.rdbConn, this.params.jobName);
    yield charts.renderBuildTimes(this, result,
      'Earliest Build times (Successful and Unstable builds)', 'earliestbuildtimes');
  } catch (error) {
    yield renderError(this, 500, error);
  }
  yield next;
}

function * getBuildResultsChart(next) {
  try {
    const result = yield provider.getExecutionResults(this.rdbConn, this.params.jobName);
    yield charts.renderBuildResults(this, result,
      'Build result distribution (All builds)', 'buildresults');
  } catch (error) {
    yield renderError(this, 500, error);
  }
  yield next;
}

function * getLatestBuildResultsChart(next) {
  try {
    const result = yield provider.getLatestExecutionResults(this.rdbConn, this.params.jobName);
    yield charts.renderBuildResults(this, result,
      'Build result distribution (Latest Builds)', 'latestbuildresults');
  } catch (error) {
    yield renderError(this, 500, error);
  }
  yield next;
}

function * getEarliestBuildResultsChart(next) {
  try {
    const result = yield provider.getEarliestExecutionResults(this.rdbConn, this.params.jobName);
    yield charts.renderBuildResults(this, result,
      'Build result distribution (Earliest Builds)', 'earliestbuildresults');
  } catch (error) {
    yield renderError(this, 500, error);
  }
  yield next;
}

function* error500() {
  yield renderError(this, 500, { message: 'Internal server error' });
}

function* error404() {
  if ((this.status || 404) === 404) {
    yield renderError(this, 404, { message: 'Not found' });
  }
}

function* renderError(res, status, error) {
  yield res.render('templates/_error', { status, error });
}

router.get('/', getJobs);
router.get('/:jobName', getJob);
router.get('/:jobName/tests', getJobTestsPage);

router.get('/:jobName/charts/buildtimes', getBuildTimesChart);
router.get('/:jobName/charts/latestbuildtimes', getLatestBuildTimesChart);
router.get('/:jobName/charts/earliestbuildtimes', getEarliestBuildTimesChart);

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
router.get('/error500', error500);
router.get('*', error404);

module.exports = router.routes();
