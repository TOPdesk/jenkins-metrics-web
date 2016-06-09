const rethink = require('rethinkdb');
const config = require('config');

const TABLE_NAME = 'jenkins_metrics';
const DATABASE_NAME = config.get('database.name');
const INDEX = { index: 'jobName' };


function getTable() {
  return getDb().table(TABLE_NAME);
}

function getDb() {
  return rethink.db(DATABASE_NAME);
}

function percentBasedLimit(jobName, percent) {
  return getTable()
    .getAll(jobName, INDEX)
    .count()
    .mul(percent)
    .div(100)
    .ceil();
}

module.exports = {
  getTable,
  limit: {
    percent: percentBasedLimit
  }
};
