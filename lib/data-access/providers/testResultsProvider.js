const rethink = require('rethinkdb');
const config = require('config');
const tableProvider = require('./../database');

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

function* getTestResultAverages(conn, jobName) {
  return {
    skipped: {
      overall: yield getAverageSkippedTests(conn, jobName),
      earliest: yield getEarliestAverageSkippedTests(conn, jobName),
      latest: yield getLatestAverageSkippedTests(conn, jobName)
    },
    failed: {
      overall: yield getAverageFailedTests(conn, jobName),
      earliest: yield getEarliestAverageFailedTests(conn, jobName),
      latest: yield getLatestAverageFailedTests(conn, jobName)
    }
  };
}

function getAverageSkippedTests(conn, jobName) {
  return getAverageTestsWithResult(jobName, 'skipped')
    .run(conn);
}

function getEarliestAverageSkippedTests(conn, jobName) {
  const percent = config.has(TEST_RESULTS_EARLIEST_LIMIT)
    ? config.get(TEST_RESULTS_EARLIEST_LIMIT)
    : DEFAULT_LIMIT_PERCENT;
  return getLimitedAverageTestsWithResult(jobName, 'skipped', percent, rethink.asc('timestamp'))
    .run(conn);
}

function getLatestAverageSkippedTests(conn, jobName) {
  const percent = config.has(TEST_RESULTS_LATEST_LIMIT)
    ? config.get(TEST_RESULTS_LATEST_LIMIT)
    : DEFAULT_LIMIT_PERCENT;
  return getLimitedAverageTestsWithResult(jobName, 'skipped', percent, rethink.desc('timestamp'))
    .run(conn);
}

function getAverageFailedTests(conn, jobName) {
  return getAverageTestsWithResult(jobName, 'failed')
    .run(conn);
}

function getEarliestAverageFailedTests(conn, jobName) {
  const percent = config.has(TEST_RESULTS_EARLIEST_LIMIT)
    ? config.get(TEST_RESULTS_EARLIEST_LIMIT)
    : DEFAULT_LIMIT_PERCENT;
  return getLimitedAverageTestsWithResult(jobName, 'failed', percent, rethink.asc('timestamp'))
    .run(conn);
}

function getLatestAverageFailedTests(conn, jobName) {
  const percent = config.has(TEST_RESULTS_LATEST_LIMIT)
    ? config.get(TEST_RESULTS_LATEST_LIMIT)
    : DEFAULT_LIMIT_PERCENT;
  return getLimitedAverageTestsWithResult(jobName, 'failed', percent, rethink.desc('timestamp'))
    .run(conn);
}

function getAverageTestsWithResult(jobName, result) {
  return getTestResultData(jobName)
    .avg(test => test(result))
    .default(0);
}

function getLimitedAverageTestsWithResult(jobName, result, percent, order) {
  return getLimitedTestResultData(jobName, percent, order)
    .avg(test => test(result))
    .default(0);
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
  getLatestTestResultDistribution,
  getTestResultAverages
};
