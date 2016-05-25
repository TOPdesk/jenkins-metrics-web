const router = require('koa-router')();
const provider = require('./data-access/dataProvider');


router.get('/', getJobs);
router.get('/:jobName', getJob);

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
    yield this.render('_job', { name: this.params.jobName, builds: result });
  } catch (error) {
    this.status = 500;
    this.body = error.message;
  }
  yield next;
}

module.exports = router.routes();
