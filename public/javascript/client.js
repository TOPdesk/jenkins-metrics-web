(function init() {
  function selectJob(job) {
    var content = $('#content');
    var jobs = $('#jobs');
    $.get('/' + job, function completed(result) {
      window.location.hash = '#!' + job;
      content.html(result);
      jobs.find('li').removeClass('active');
      jobs.find('li[data-job="' + job + '"]').addClass('active');
    }).fail(function failed() {
      jobs.find('li').removeClass('active');
      console.error('Failed to load', job);
      content.html('ERROR');
    });
  }

  function handleHashChange() {
    if (window.location.hash.substr(0, 2) === '#!') {
      selectJob(window.location.hash.substr(2));
    }
  }

  $(document).ready(handleHashChange);
  $(window).bind('hashchange', handleHashChange);
}());
