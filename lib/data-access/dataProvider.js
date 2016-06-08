const rethink = require('rethinkdb');
const config = require('config');
const tableProvider = require('./tableProvider');

const INDEX_NAME = 'jobName';
const EXECUTION_RESULTS_EARLIEST_LIMIT = 'statistics.executionResults.earliestBatchLimitPercent';
const EXECUTION_RESULTS_LATEST_LIMIT = 'statistics.executionResults.latestBatchLimitPercent';
const EXECUTION_TIMES_EARLIEST_LIMIT = 'statistics.executionTimes.earliestBatchLimitPercent';
const EXECUTION_TIMES_LATEST_LIMIT = 'statistics.executionTimes.latestBatchLimitPercent';
const TEST_RESULTS_EARLIEST_LIMIT = 'statistics.testResults.earliestBatchLimitPercent';
const TEST_RESULTS_LATEST_LIMIT = 'statistics.testResults.latestBatchLimitPercent';
const DEFAULT_LIMIT_PERCENT = 10;

function getExecutionTimes(conn, jobName) {
  return tableProvider.getTable()
    .getAll(jobName, { index: INDEX_NAME })
    .filter(rethink.row('result').eq('SUCCESS')
      .or(rethink.row('result').eq('UNSTABLE')))
    .orderBy('timestamp')
    .pluck('timestamp', 'duration', 'result')
    .run(conn);
}

function getExecutionResults(conn, jobName) {
  return tableProvider.getTable()
    .getAll(jobName, { index: INDEX_NAME })
    .pluck('result')
    .group('result')
    .count()
    .run(conn);
}

function getTestResults(conn, jobName) {
  return getTestResultData(jobName)
    .orderBy('timestamp')
    .run(conn);
}

function getEarliestTestResults(conn, jobName) {
  const percent = config.has(TEST_RESULTS_EARLIEST_LIMIT)
    ? config.get(TEST_RESULTS_EARLIEST_LIMIT)
    : DEFAULT_LIMIT_PERCENT;
  return getLimitedTestResultData(jobName, percent, rethink.asc('timestamp'))
    .run(conn);
}

function getLatestTestResults(conn, jobName) {
  const percent = config.has(TEST_RESULTS_LATEST_LIMIT)
    ? config.get(TEST_RESULTS_LATEST_LIMIT)
    : DEFAULT_LIMIT_PERCENT;
  return getLimitedTestResultData(jobName, percent, rethink.desc('timestamp'))
    .run(conn);
}

function getTestResultDistribution(conn, jobName) {
  return getTestResultData(jobName)
    .without('timestamp')
    .reduce(toTestResultTypes)
    .default(getEmptyTestResultDistribution())
    .run(conn);
}

function getEarliestTestResultDistribution(conn, jobName) {
  const percent = config.has(TEST_RESULTS_EARLIEST_LIMIT)
    ? config.get(TEST_RESULTS_EARLIEST_LIMIT)
    : DEFAULT_LIMIT_PERCENT;
  return getLimitedTestResultData(jobName, percent, rethink.asc('timestamp'))
    .without('timestamp')
    .reduce(toTestResultTypes)
    .default(getEmptyTestResultDistribution())
    .run(conn);
}

function getLatestTestResultDistribution(conn, jobName) {
  const percent = config.has(TEST_RESULTS_LATEST_LIMIT)
    ? config.get(TEST_RESULTS_LATEST_LIMIT)
    : DEFAULT_LIMIT_PERCENT;
  return getLimitedTestResultData(jobName, percent, rethink.desc('timestamp'))
    .without('timestamp')
    .reduce(toTestResultTypes)
    .default(getEmptyTestResultDistribution())
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

function getAverageExecutionTime(conn, jobName) {
  return tableProvider.getTable()
    .getAll(jobName, { index: INDEX_NAME })
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

function getLimitedAverageExecutionTime(jobName, percent, order) {
  return tableProvider.getTable()
    .getAll(jobName, { index: INDEX_NAME })
    .orderBy(order)
    .limit(percentBasedLimit(jobName, percent))
    .avg('duration');
}

function getLimitedExecutionResults(jobName, percent, order) {
  return tableProvider.getTable()
    .getAll(jobName, { index: INDEX_NAME })
    .orderBy(order)
    .limit(percentBasedLimit(jobName, percent))
    .pluck('result')
    .group('result')
    .count();
}

function getLimitedExecutionTimes(jobName, percent, order) {
  return tableProvider.getTable()
    .getAll(jobName, { index: INDEX_NAME })
    .filter(rethink.row('result').eq('SUCCESS')
      .or(rethink.row('result').eq('UNSTABLE')))
    .orderBy(order)
    .limit(percentBasedLimit(jobName, percent))
    .orderBy('timestamp')
    .pluck('timestamp', 'duration', 'result');
}

function getLimitedTestResultData(jobName, percent, order) {
  return getTestResultData(jobName)
    .orderBy(order)
    .limit(percentBasedLimit(jobName, percent))
    .orderBy('timestamp');
}

function getTestResultData(jobName) {
  return tableProvider.getTable()
    .getAll(jobName, { index: INDEX_NAME })
    .pluck('actions', 'timestamp')
    .map(toMergedTestResults)
    .without('actions')
    .map(toSimpleCounts)
    .without('mergedActions')
    .map(toCalculatedSuccessfulTests);
}

function percentBasedLimit(jobName, percent) {
  return tableProvider.getTable().getAll(jobName, { index: INDEX_NAME })
    .count()
    .mul(percent)
    .div(100)
    .ceil();
}

function toMergedTestResults(val) {
  return val.merge({
    mergedActions: val.getField('actions')
      .without('urlName')
      .reduce(summarizedActions)
      .default({
        failCount: 0,
        skipCount: 0,
        totalCount: 0
      })
  });
}

function toSimpleCounts(val) {
  return val.merge({
    failed: val.getField('mergedActions').getField('failCount'),
    skipped: val.getField('mergedActions').getField('skipCount'),
    total: val.getField('mergedActions').getField('totalCount')
  });
}

function toTestResultTypes(left, right) {
  return {
    failed: left.getField('failed').add(right.getField('failed')),
    successful: left.getField('successful').add(right.getField('successful')),
    skipped: left.getField('skipped').add(right.getField('skipped'))
  };
}

function getEmptyTestResultDistribution() {
  return {
    failed: 0,
    successful: 0,
    skipped: 0
  };
}

function summarizedActions(left, right) {
  return {
    failCount: left.getField('failCount').add(right.getField('failCount')),
    skipCount: left.getField('skipCount').add(right.getField('skipCount')),
    totalCount: left.getField('totalCount').add(right.getField('totalCount'))
  };
}

function toCalculatedSuccessfulTests(val) {
  return val
    .merge({
      successful: val.getField('total').sub(
          val.getField('failed').add(val.getField('skipped')))
    })
    .without('total');
}

module.exports = {
  getExecutionTimes,
  getLatestExecutionTimes,
  getEarliestExecutionTimes,
  getExecutionResults,
  getLatestExecutionResults,
  getEarliestExecutionResults,
  getTestResults,
  getEarliestTestResults,
  getLatestTestResults,
  getTestResultDistribution,
  getEarliestTestResultDistribution,
  getLatestTestResultDistribution,
  getAverageExecutionTime,
  getEarliestAverageExecutionTime,
  getLatestAverageExecutionTime
};
