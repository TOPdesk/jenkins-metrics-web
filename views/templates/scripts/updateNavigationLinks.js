function updateNavigationLinks(jobName) {
  var jobs = $('#jobs').find('[data-job]');
  var selectedJob = jobs.filter('[data-job="' + jobName + '"]');
  var prev = $.merge(selectedJob.prev(), jobs.last());
  var next = $.merge(selectedJob.next(), jobs.first());
  $('#previous-job').attr('href', '#!' + prev.attr('data-job'));
  $('#next-job').attr('href', '#!' + next.attr('data-job'));
}
