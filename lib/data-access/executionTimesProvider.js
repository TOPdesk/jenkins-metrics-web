const rethink = require('rethinkdb');
const config = require('config');
const db = require('./database');

const EXECUTION_TIMES_EARLIEST_LIMIT = 'statistics.executionTimes.earliestBatchLimitPercent';
const EXECUTION_TIMES_LATEST_LIMIT = 'statistics.executionTimes.latestBatchLimitPercent';
const DEFAULT_LIMIT_PERCENT = 10;
const INDEX = { index: 'jobName' };

function getExecutionTimes(conn, jobName) {
  return db.getTable()
    .getAll(jobName, INDEX)
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
  return getLimitedExecutionTimes(jobName, percent, rethink.desc('timestamp'))
    .run(conn);
}

function getEarliestExecutionTimes(conn, jobName) {
  const percent = config.has(EXECUTION_TIMES_EARLIEST_LIMIT)
    ? config.get(EXECUTION_TIMES_EARLIEST_LIMIT)
    : DEFAULT_LIMIT_PERCENT;
  return getLimitedExecutionTimes(jobName, percent, rethink.asc('timestamp'))
    .run(conn);
}

function getAverageExecutionTime(conn, jobName) {
  return db.getTable()
    .getAll(jobName, INDEX)
    .avg('duration')
    .run(conn);
}

function getLatestAverageExecutionTime(conn, jobName) {
  const percent = config.has(EXECUTION_TIMES_LATEST_LIMIT)
    ? config.get(EXECUTION_TIMES_LATEST_LIMIT)
    : DEFAULT_LIMIT_PERCENT;
  return getLimitedAverageExecutionTime(jobName, percent, rethink.desc('timestamp'))
    .run(conn);
}

function getEarliestAverageExecutionTime(conn, jobName) {
  const percent = config.has(EXECUTION_TIMES_EARLIEST_LIMIT)
    ? config.get(EXECUTION_TIMES_EARLIEST_LIMIT)
    : DEFAULT_LIMIT_PERCENT;
  return getLimitedAverageExecutionTime(jobName, percent, rethink.asc('timestamp'))
    .run(conn);
}

function getLimitedExecutionTimes(jobName, percent, order) {
  return db.getTable()
    .getAll(jobName, INDEX)
    .filter(rethink.row('result').eq('SUCCESS')
      .or(rethink.row('result').eq('UNSTABLE')))
    .orderBy(order)
    .limit(db.limit.percent(jobName, percent))
    .orderBy('timestamp')
    .pluck('timestamp', 'duration', 'result');
}

function getLimitedAverageExecutionTime(jobName, percent, order) {
  return db.getTable()
    .getAll(jobName, INDEX)
    .orderBy(order)
    .limit(db.limit.percent(jobName, percent))
    .avg('duration');
}


module.exports = {
  getExecutionTimes,
  getLatestExecutionTimes,
  getEarliestExecutionTimes,
  getAverageExecutionTime,
  getEarliestAverageExecutionTime,
  getLatestAverageExecutionTime
};
