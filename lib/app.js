const koa = require('koa');
const serve = require('koa-static');
const userAgent = require('koa-useragent');
const scss = require('koa-scss');
const views = require('koa-views');
const config = require('config');
const clientConnection = require('./data-access/clientConnection');
const serverConnection = require('./data-access/serverConnection');
const errorPageRouter = require('./errorPageRouter');
const jobsRouter = require('./jobsRouter');
const buildTimesChartsRouter = require('./buildTimesChartsRouter');
const buildResultsChartsRouter = require('./buildResultsChartsRouter');
const testResultsChartsRouter = require('./testResultsChartsRouter');
const using = require('bluebird').Promise.using;

const app = koa();
app.use(userAgent());
app.use(scss(`${__dirname}/../public`));
app.use(serve(`${__dirname}/../public`));
app.use(views(`${__dirname}/../views`, { extension: 'jade' }));

app.use(clientConnection.create);
app.use(jobsRouter);
app.use(buildTimesChartsRouter);
app.use(buildResultsChartsRouter);
app.use(testResultsChartsRouter);
app.use(errorPageRouter);
app.use(clientConnection.dispose);

using(serverConnection.create(), () => {
  const port = config.has('server.port') ? config.get('server.port') : 80;
  app.listen(port);
}).catch(error => console.error(error));
