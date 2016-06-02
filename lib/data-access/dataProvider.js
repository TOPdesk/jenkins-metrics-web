const rethink = require('rethinkdb');
const config = require('config');

const TABLE_NAME = 'jenkins_metrics';
const INDEX_NAME = 'jobName';
const DATABASE_NAME = config.get('database.name');


function getJobs(conn) {
  return getTable()
    .distinct({ index: INDEX_NAME })
    .run(conn)
    .then((cursor) => cursor.toArray());
}

function getBuilds(conn, jobName) {
  return getTable()
    .getAll(jobName, { index: INDEX_NAME })
    .orderBy(rethink.desc('id'))
    .run(conn);
}

function getExecutionTimes(conn, jobName) {
  return getTable()
    .getAll(jobName, { index: INDEX_NAME })
    .filter(rethink.row('result').eq('SUCCESS')
      .or(rethink.row('result').eq('UNSTABLE')))
    .orderBy('timestamp')
    .pluck('timestamp', 'duration', 'result')
    .run(conn);
}

function getExecutionResults(conn, jobName) {
  return getTable()
    .getAll(jobName, { index: INDEX_NAME })
    .pluck('result')
    .group('result')
    .count()
    .run(conn);
}

function getLatestExecutionResults(conn, jobName) {
  return getLimitedExecutionResults(conn, jobName, 10, rethink.asc('timestamp'));
}

function getEarliestExecutionResults(conn, jobName) {
  return getLimitedExecutionResults(conn, jobName, 10, rethink.desc('timestamp'));
}

function getLimitedExecutionResults(conn, jobName, percent, order) {
  return getTable()
    .getAll(jobName, { index: INDEX_NAME })
    .orderBy(order)
    .limit(getTable().getAll(jobName, { index: INDEX_NAME })
      .count()
      .mul(percent)
      .div(100)
      .ceil())
    .pluck('result')
    .group('result')
    .count()
    .run(conn);
}

function getTable() {
  return getDb().table(TABLE_NAME);
}

function getDb() {
  return rethink.db(DATABASE_NAME);
}

module.exports = {
  getJobs,
  getBuilds,
  getExecutionTimes,
  getExecutionResults,
  getLatestExecutionResults,
  getEarliestExecutionResults
};
