function millisecsToTimeString(millis) {
  var time = millis / 1000;
  if (millis < 0) {
    time *= -1;
  }
  var hours = Math.floor(time / 3600);
  var minutes = Math.floor((time % 3600) / 60);
  var seconds = time % 60;
  return (millis < 0 ? '-' : '') + (hours > 0 ? hours + ':' : '') +
    ('00' + minutes).slice(-2) + ':' +
    ('00' + seconds).slice(-2);
}
