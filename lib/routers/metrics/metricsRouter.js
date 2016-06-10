const router = require('koa-router')({
  prefix: '/metrics'
});


router.use(require('./testResultMetricsRouter'));


module.exports = router.routes();
