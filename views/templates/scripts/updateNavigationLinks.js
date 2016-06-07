function updateNavigationLinks(jobName) {
  var getPage = function() {
    if (window.location.hash.substr(0, 2) === '#!') {
      var hash = window.location.hash.substr(2);
      var fragments = hash.split('/');
      return fragments[1]
        ? '/' + fragments[1]
        : '';
    }
  };
  var jobs = $('#jobs').find('[data-job]');
  var selectedJob = jobs.filter('[data-job="' + jobName + '"]');
  var page = getPage();
  var prev = $.merge(selectedJob.prev(), jobs.last());
  var next = $.merge(selectedJob.next(), jobs.first());
  $('#previous-job').attr('href', '#!' + prev.attr('data-job') + page);
  $('#next-job').attr('href', '#!' + next.attr('data-job') + page);
}
