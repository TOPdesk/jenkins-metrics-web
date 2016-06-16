function initializeContentScrollbar() {
  var container = $('#content');
  container.perfectScrollbar();
  $(window).resize(function() {
    container.perfectScrollbar('update');
  });
}
