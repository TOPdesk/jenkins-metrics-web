function initializeJobListScrollbar() {
  var container = $('#jobs').find('nav');
  container.perfectScrollbar();
  $(window).resize(function() {
    container.perfectScrollbar('update');
  });
}
