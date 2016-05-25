const rethink = require('rethinkdb');
const config = require('config');

const TABLE_NAME = 'jenkins_metrics';
const INDEX_NAME = 'jobName';
const DATABASE_NAME = config.get('database.name');


function getJobs(conn) {
  return getTable()
    .distinct({ index: INDEX_NAME })
    .run(conn)
    .then((cursor) => cursor.toArray());
}

function getBuilds(conn, jobName) {
  return getTable()
    .getAll(jobName, { index: INDEX_NAME })
    .orderBy(rethink.desc('id'))
    .run(conn);
}

function getTable() {
  return getDb().table(TABLE_NAME);
}

function getDb() {
  return rethink.db(DATABASE_NAME);
}


module.exports = {
  getJobs,
  getBuilds
};
