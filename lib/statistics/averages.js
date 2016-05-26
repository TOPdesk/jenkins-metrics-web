const config = require('config');


function getExecutionTimes(result) {
  const initialLimit = config.get('statistics.executionTime.initialBatchLimitPercent');
  const currentLimit = config.get('statistics.executionTime.currentBatchLimitPercent');
  const initialLength = Math.floor(result.length / 100 * initialLimit);
  const currentLength = Math.floor(result.length / 100 * currentLimit);
  return {
    initialExecutionTime: getAverageDuration(result.slice(0, initialLength)),
    currentExecutionTime: getAverageDuration(result.slice(result.length - (currentLength + 1))),
    initialLimit,
    currentLimit
  };
}

function getAverageDuration(builds) {
  return Math.floor(
    builds.reduce((duration, build) => duration + build.duration, 0) / builds.length);
}

module.exports = {
  getExecutionTimes
};
