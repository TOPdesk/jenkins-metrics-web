const router = require('koa-router')({
  prefix: '/metrics'
});


router.use(require('./buildTimeMetricsRouter'));
router.use(require('./testResultMetricsRouter'));


module.exports = router.routes();
