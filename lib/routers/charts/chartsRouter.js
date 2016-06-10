const router = require('koa-router')({
  prefix: '/charts'
});


router.use(require('./buildTimesChartsRouter'));
router.use(require('./buildResultsChartsRouter'));
router.use(require('./testResultsChartsRouter'));


module.exports = router.routes();
