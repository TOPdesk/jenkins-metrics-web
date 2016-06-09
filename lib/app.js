const koa = require('koa');
const serve = require('koa-static');
const userAgent = require('koa-useragent');
const scss = require('koa-scss');
const views = require('koa-views');
const config = require('config');
const clientConnection = require('./data-access/clientConnection');
const serverConnection = require('./data-access/serverConnection');
const errorPageRouter = require('./routers/errorPageRouter');
const jobsRouter = require('./routers/jobsRouter');
const chartsRouter = require('./routers/charts/router');
const using = require('bluebird').Promise.using;

const app = koa();
app.use(userAgent());
app.use(scss(`${__dirname}/../public`));
app.use(serve(`${__dirname}/../public`));
app.use(views(`${__dirname}/../views`, { extension: 'jade' }));

app.use(clientConnection.create);
app.use(jobsRouter);
app.use(chartsRouter);
app.use(errorPageRouter);
app.use(clientConnection.dispose);

using(serverConnection.create(), () => {
  const port = config.has('server.port') ? config.get('server.port') : 80;
  app.listen(port);
}).catch(error => console.error(error));
