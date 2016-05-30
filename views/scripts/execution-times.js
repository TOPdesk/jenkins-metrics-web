var timeFormatter = function (millis) {
  var negative = millis < 0;
  var time = millis / 1000;
  if (negative) {
    time *= -1;
  }
  var hours = Math.floor(time / 3600);
  var minutes = Math.floor((time % 3600) / 60);
  var seconds = time % 60;
  return (negative ? '-' : '') + (hours > 0 ? hours + ':' : '') +
    ('00' + minutes).slice(-2) + ':' +
    ('00' + seconds).slice(-2);
};

var formats = {
  bottom: function (timestamp) {
    return new Date(timestamp).toLocaleDateString();
  },
  left: timeFormatter
};

function getData(jobName) {
  $.getJSON('/' + jobName + '/execution-times.json', function (executionTimes) {
    var initial = executionTimes.averages.initialExecutionTime;
    var current = executionTimes.averages.currentExecutionTime;
    var diff = current - initial;
    $('#execution-time').epoch({
      type: 'bar',
      data: executionTimes.chartData,
      tickFormats: formats
    });
    $('#execution-time-initial-average').text(timeFormatter(initial));
    $('#execution-time-current-average').text(timeFormatter(current));
    $('#execution-time-change')
      .text(timeFormatter(diff))
      .addClass(diff > 0 ? 'increasing' : 'decreasing');
  });
}

