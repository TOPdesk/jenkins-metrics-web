const router = require('koa-router')();
const jobProvider = require('./../data-access/providers/jobProvider');
const executionTimesProvider = require('../data-access/providers/executionTimesProvider');
const testResultsProvider = require('../data-access/providers/testResultsProvider');
const packageJson = require('../../package.json');


function* getJobs(next) {
  try {
    const result = yield jobProvider.getJobs(this.rdbConn);
    yield this.render('index', { jobs: result, package: packageJson });
  } catch (error) {
    this.status = 500;
  }
  yield next;
}

function* getJobOverviewPage(next) {
  try {
    if (yield jobProvider.isJobAvailable(this.rdbConn, this.params.jobName)) {
      const averageBuildTime = yield executionTimesProvider
        .getAverageExecutionTime(this.rdbConn, this.params.jobName);
      const earliestAverageBuildTime = yield executionTimesProvider
        .getEarliestAverageExecutionTime(this.rdbConn, this.params.jobName);
      const latestAverageBuildTime = yield executionTimesProvider
        .getLatestAverageExecutionTime(this.rdbConn, this.params.jobName);
      const averageBuildTimeImprovement = earliestAverageBuildTime - latestAverageBuildTime;
      const averageSkippedTests = yield testResultsProvider
        .getAverageSkippedTests(this.rdbConn, this.params.jobName);
      const earliestAverageSkippedTests = yield testResultsProvider
        .getEarliestAverageSkippedTests(this.rdbConn, this.params.jobName);
      const latestAverageSkippedTests = yield testResultsProvider
        .getLatestAverageSkippedTests(this.rdbConn, this.params.jobName);
      const averageSkippedTestsImprovement =
        earliestAverageSkippedTests - latestAverageSkippedTests;
      yield this.render('templates/jobs/_overview', {
        name: this.params.jobName,
        page: 'overview',
        averageBuildTime,
        earliestAverageBuildTime,
        latestAverageBuildTime,
        averageBuildTimeImprovement,
        averageSkippedTests,
        earliestAverageSkippedTests,
        latestAverageSkippedTests,
        averageSkippedTestsImprovement
      });
    } else {
      this.status = 404;
    }
  } catch (error) {
    console.log(error);
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
