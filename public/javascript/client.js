(function init() {
  function selectJob(job, page) {
    var content = $('#content');
    var jobs = $('#jobs');
    var suffix = page ? '/' + page : '';
    $.get('/' + job + suffix, function completed(result) {
      window.location.hash = '#!' + job + suffix;
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
    var hash = window.location.hash;
    var fragments;
    if (hash.substr(0, 2) === '#!') {
      fragments = hash
        .substr(2)
        .split('/');
      selectJob(fragments[0], fragments[1]);
    }
  }

  function addMenuExpandAndCollapseHandlers() {
    $('#jobs-collapse').click(function onCollapseClick() {
      $('#jobs').removeClass('expanded').addClass('collapsed');
      handleHashChange();
    });
    $('#jobs-expand').click(function onExpandClick() {
      $('#jobs').removeClass('collapsed').addClass('expanded');
      handleHashChange();
    });
  }

  function addSearchHandlers() {
    var jobsFilter = $('#jobs-filter');
    jobsFilter.keyup(function onFilterChange(event) {
      var jobs = $('#jobs').find('li[data-job]');
      var filter = jobsFilter
        .val()
        .trim()
        .toLocaleLowerCase();
      jobs.removeClass('hidden');
      if (event.keyCode === 27) {
        jobsFilter.val('');
        return;
      }
      jobs.filter(function jobFilter(index, element) {
        return $(element)
          .attr('data-job')
          .toLocaleLowerCase()
          .indexOf(filter) === -1;
      }).addClass('hidden');
    });
  }

  $(document).ready(handleHashChange);
  $(document).ready(addMenuExpandAndCollapseHandlers);
  $(document).ready(addSearchHandlers);
  $(window).bind('hashchange', handleHashChange);
}());
