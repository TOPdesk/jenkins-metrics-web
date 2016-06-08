const rethink = require('rethinkdb');
const config = require('config');

const TABLE_NAME = 'jenkins_metrics';
const DATABASE_NAME = config.get('database.name');


function getTable() {
  return getDb().table(TABLE_NAME);
}

function getDb() {
  return rethink.db(DATABASE_NAME);
}


module.exports = {
  getTable
};
