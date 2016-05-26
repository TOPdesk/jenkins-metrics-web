const router = require('koa-router')();
const provider = require('./data-access/dataProvider');
const averages = require('./statistics/averages.js');
const config = require('config');

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

function* getExecutionTimes(next) {
  try {
    const result = yield provider.getExecutionTimes(this.rdbConn, this.params.jobName);
    const data = {
      averages: averages.getExecutionTimes(result),
      chartData: [{
        label: 'Build times',
        values: result.map((value) => ({
          x: value.timestamp,
          y: value.duration
        }))
      }]
    };
    this.type = 'json';
    this.body = data;
  } catch (error) {
    this.status = 500;
    this.body = error.message;
  }
  yield next;
}

router.get('/', getJobs);
router.get('/:jobName', getJob);
router.get('/:jobName/execution-times.json', getExecutionTimes);


module.exports = router.routes();
