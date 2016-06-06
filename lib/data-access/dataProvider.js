const rethink = require('rethinkdb');
const config = require('config');

const TABLE_NAME = 'jenkins_metrics';
const INDEX_NAME = 'jobName';
const DATABASE_NAME = config.get('database.name');
const EXECUTION_RESULTS_EARLIEST_LIMIT = 'statistics.executionResults.earliestBatchLimitPercent';
const EXECUTION_RESULTS_LATEST_LIMIT = 'statistics.executionResults.latestBatchLimitPercent';
const EXECUTION_TIMES_EARLIEST_LIMIT = 'statistics.executionTimes.earliestBatchLimitPercent';
const EXECUTION_TIMES_LATEST_LIMIT = 'statistics.executionTimes.latestBatchLimitPercent';
const DEFAULT_LIMIT_PERCENT = 10;

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

function getLatestExecutionTimes(conn, jobName) {
  const percent = config.has(EXECUTION_TIMES_LATEST_LIMIT)
    ? config.get(EXECUTION_TIMES_LATEST_LIMIT)
    : DEFAULT_LIMIT_PERCENT;
  return getLimitedExecutionTimes(conn, jobName, percent, rethink.asc('timestamp'));
}

function getEarliestExecutionTimes(conn, jobName) {
  const percent = config.has(EXECUTION_TIMES_EARLIEST_LIMIT)
    ? config.get(EXECUTION_TIMES_EARLIEST_LIMIT)
    : DEFAULT_LIMIT_PERCENT;
  return getLimitedExecutionTimes(conn, jobName, percent, rethink.desc('timestamp'));
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
  const percent = config.has(EXECUTION_RESULTS_LATEST_LIMIT)
    ? config.get(EXECUTION_RESULTS_LATEST_LIMIT)
    : DEFAULT_LIMIT_PERCENT;
  return getLimitedExecutionResults(conn, jobName, percent, rethink.asc('timestamp'));
}

function getEarliestExecutionResults(conn, jobName) {
  const percent = config.has(EXECUTION_RESULTS_EARLIEST_LIMIT)
    ? config.get(EXECUTION_RESULTS_EARLIEST_LIMIT)
    : DEFAULT_LIMIT_PERCENT;
  return getLimitedExecutionResults(conn, jobName, percent, rethink.desc('timestamp'));
}

function getLimitedExecutionResults(conn, jobName, percent, order) {
  return getTable()
    .getAll(jobName, { index: INDEX_NAME })
    .orderBy(order)
    .limit(percentBasedLimit(jobName, percent))
    .pluck('result')
    .group('result')
    .count()
    .run(conn);
}

function getLimitedExecutionTimes(conn, jobName, percent, order) {
  return getTable()
    .getAll(jobName, { index: INDEX_NAME })
    .filter(rethink.row('result').eq('SUCCESS')
      .or(rethink.row('result').eq('UNSTABLE')))
    .orderBy(order)
    .limit(percentBasedLimit(jobName, percent))
    .orderBy('timestamp')
    .pluck('timestamp', 'duration', 'result')
    .run(conn);}

function percentBasedLimit(jobName, percent) {
  return getTable().getAll(jobName, { index: INDEX_NAME })
    .count()
    .mul(percent)
    .div(100)
    .ceil();
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
  getLatestExecutionTimes,
  getEarliestExecutionTimes,
  getExecutionResults,
  getLatestExecutionResults,
  getEarliestExecutionResults
};
