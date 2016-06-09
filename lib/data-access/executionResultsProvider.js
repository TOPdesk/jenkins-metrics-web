const tableProvider = require('./tableProvider');
const config = require('config');
const rethink = require('rethinkdb');

const EXECUTION_RESULTS_EARLIEST_LIMIT = 'statistics.executionResults.earliestBatchLimitPercent';
const EXECUTION_RESULTS_LATEST_LIMIT = 'statistics.executionResults.latestBatchLimitPercent';
const DEFAULT_LIMIT_PERCENT = 10;
const INDEX = { index: 'jobName' };

function getExecutionResults(conn, jobName) {
  return tableProvider.getTable()
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
  return tableProvider.getTable()
    .getAll(jobName, INDEX)
    .orderBy(order)
    .limit(percentBasedLimit(jobName, percent))
    .pluck('result')
    .group('result')
    .count();
}

// TODO: move to general location
function percentBasedLimit(jobName, percent) {
  return tableProvider.getTable()
    .getAll(jobName, INDEX)
    .count()
    .mul(percent)
    .div(100)
    .ceil();
}

module.exports = {
  getExecutionResults,
  getLatestExecutionResults,
  getEarliestExecutionResults
};
