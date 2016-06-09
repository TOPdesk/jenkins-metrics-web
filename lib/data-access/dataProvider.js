const rethink = require('rethinkdb');
const config = require('config');
const tableProvider = require('./database');

const INDEX_NAME = 'jobName';
const TEST_RESULTS_EARLIEST_LIMIT = 'statistics.testResults.earliestBatchLimitPercent';
const TEST_RESULTS_LATEST_LIMIT = 'statistics.testResults.latestBatchLimitPercent';
const DEFAULT_LIMIT_PERCENT = 10;


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
  getTestResults,
  getEarliestTestResults,
  getLatestTestResults,
  getTestResultDistribution,
  getEarliestTestResultDistribution,
  getLatestTestResultDistribution
};
