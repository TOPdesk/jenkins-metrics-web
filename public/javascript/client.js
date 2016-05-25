(function init() {
  function select(event) {
    var target = $(event.target);
    var job = target.data('job');
    $.get('/' + job, function completed(result) {
      $('#content').html(result);
    }).fail(function failed() {
      console.error('Failed to load', job);
      $('#content').html('ERROR');
    });
  }

  $(document).ready(function addJobClickListeners() {
    $('#list')
      .find('[data-job]')
      .click(select);
  });

}());
