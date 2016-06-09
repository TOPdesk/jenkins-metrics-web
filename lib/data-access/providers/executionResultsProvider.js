const rethink = require('rethinkdb');
const db = require('./../database');
const config = require('config');

const EXECUTION_RESULTS_EARLIEST_LIMIT = 'statistics.executionResults.earliestBatchLimitPercent';
const EXECUTION_RESULTS_LATEST_LIMIT = 'statistics.executionResults.latestBatchLimitPercent';
const DEFAULT_LIMIT_PERCENT = 10;
const INDEX = { index: 'jobName' };

function getExecutionResults(conn, jobName) {
  return db.getTable()
    .getAll(jobName, INDEX)
    .pluck('result')
    .group('result')
    .count()
    .run(conn);
}

function getLatestExecutionResults(conn, jobName) {
  const percent = config.has(EXECUTION_RESULTS_LATEST_LIMIT)
    ? config.get(EXECUTION_RESULTS_LATEST_LIMIT)
    : DEFAULT_LIMIT_PERCENT;
  return getLimitedExecutionResults(jobName, percent, rethink.desc('timestamp'))
    .run(conn);
}

function getEarliestExecutionResults(conn, jobName) {
  const percent = config.has(EXECUTION_RESULTS_EARLIEST_LIMIT)
    ? config.get(EXECUTION_RESULTS_EARLIEST_LIMIT)
    : DEFAULT_LIMIT_PERCENT;
  return getLimitedExecutionResults(jobName, percent, rethink.asc('timestamp'))
    .run(conn);
}

function getLimitedExecutionResults(jobName, percent, order) {
  return db.getTable()
    .getAll(jobName, INDEX)
    .orderBy(order)
    .limit(db.limit.percent(jobName, percent))
    .pluck('result')
    .group('result')
    .count();
}


module.exports = {
  getExecutionResults,
  getLatestExecutionResults,
  getEarliestExecutionResults
};
