const router = require('koa-router')();
const jobProvider = require('./../data-access/providers/jobProvider');
const executionTimesProvider = require('../data-access/providers/executionTimesProvider');
const packageJson = require('../../package.json');
const config = require('config');
const EXCLUDES = config.get('jenkins') ? config.get('jenkins').get('excludes') : [];

function* getJobs(next) {
  try {
    const result = yield jobProvider.getJobs(this.rdbConn)
      .filter(jobName => EXCLUDES.indexOf(jobName) === -1);
    yield this.render('index', { jobs: result, package: packageJson });
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

function* getJobOverviewPage(next) {
  try {
    if (yield jobProvider.isJobAvailable(this.rdbConn, this.params.jobName)) {
      const buildTimeAverages = yield executionTimesProvider
        .getExecutionTimeAverages(this.rdbConn, this.params.jobName);
      yield this.render('templates/jobs/_overview', {
        name: this.params.jobName,
        page: 'overview',
        buildTimeAverages
      });
    } else {
      this.status = 404;
    }
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

function* getJobBuildsPage(next) {
  try {
    if (yield jobProvider.isJobAvailable(this.rdbConn, this.params.jobName)) {
      yield this.render('templates/jobs/_builds', {
        name: this.params.jobName,
        page: 'builds'
      });
    } else {
      this.status = 404;
    }
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

function* getJobTestsPage(next) {
  try {
    if (yield jobProvider.isJobAvailable(this.rdbConn, this.params.jobName)) {
      yield this.render('templates/jobs/_tests', {
        name: this.params.jobName,
        page: 'tests'
      });
    } else {
      this.status = 404;
    }
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

router.get('/', getJobs);
router.get('/:jobName', getJobOverviewPage);
router.get('/:jobName/overview', getJobOverviewPage);
router.get('/:jobName/builds', getJobBuildsPage);
router.get('/:jobName/tests', getJobTestsPage);

module.exports = router.routes();
