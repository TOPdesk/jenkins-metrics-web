const router = require('koa-router')();
const jobProvider = require('./../data-access/providers/jobProvider');
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

function* getJob(next) {
  try {
    if (yield jobProvider.isJobAvailable(this.rdbConn, this.params.jobName)) {
      yield this.render('templates/jobs/_default_job_page', {
        name: this.params.jobName,
        page: 'default'
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
      yield this.render('templates/jobs/_tests_job_page', {
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
router.get('/:jobName', getJob);
router.get('/:jobName/tests', getJobTestsPage);

module.exports = router.routes();
