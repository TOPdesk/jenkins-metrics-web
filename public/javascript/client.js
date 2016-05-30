(function init() {
  function select(event) {
    var target = $(event.target);
    var job = target.data('job');
    selectJob(job);
  }

  function selectJob(job) {
    $.get('/' + job, function completed(result) {
      window.location.hash = '#!' + job;
      $('#content').html(result);
    }).fail(function failed() {
      console.error('Failed to load', job);
      $('#content').html('ERROR');
    });
  }

  function handleHashChange() {
    if (window.location.hash.substr(0, 2) === '#!') {
      selectJob(window.location.hash.substr(2));
    }
  }

  $(document).ready(function addJobClickListeners() {
    $('#list')
      .find('[data-job]')
      .click(select);
  });
  $(document).ready(handleHashChange);
  $(window).bind('hashchange', handleHashChange);
}());
