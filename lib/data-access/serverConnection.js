const config = require('config');
const rethink = require('rethinkdb');


function create() {
  return rethink.connect(config.get('database'))
    .disposer(connectionDisposer);
}

function connectionDisposer(conn) {
  if (conn) {
    try {
      conn.close();
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
}


module.exports = {
  create
};
