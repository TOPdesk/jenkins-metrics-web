const config = require('config');
const rethink = require('rethinkdb');


function* create(next) {
  try {
    this.rdbConn = yield rethink.connect(config.get('database'));
  } catch (err) {
    this.status = 500;
    this.body = err.message;
  }
  yield next;
}

function* dispose(next) {
  this.rdbConn.close();
  yield next;
}


module.exports = {
  create,
  dispose
};
