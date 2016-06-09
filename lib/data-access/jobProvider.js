const rethink = require('rethinkdb');
const db = require('./database');

const INDEX = { index: 'jobName' };


function getJobs(conn) {
  return db.getTable()
    .distinct(INDEX)
    .run(conn)
    .then((cursor) => cursor.toArray());
}

function isJobAvailable(conn, jobName) {
  return rethink.not(db.getTable()
    .getAll(jobName, INDEX)
    .isEmpty())
    .run(conn);
}


module.exports = {
  isJobAvailable,
  getJobs
};
