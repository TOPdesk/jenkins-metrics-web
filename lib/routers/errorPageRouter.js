const router = require('koa-router')();

function* elseRenderError() {
  const status = this.status || 404;
  switch (status) {
    case 404:
      yield renderError(this, 404, { message: 'Not found' });
      break;
    case 500:
      yield renderError(this, 500, { message: 'Internal server error' });
      break;
    case 200:
    default:
      // do nothing
  }
}

function* renderError(res, status, error) {
  yield res.render('templates/_error', { status, error });
}

router.get('*', elseRenderError);

module.exports = router.routes();
