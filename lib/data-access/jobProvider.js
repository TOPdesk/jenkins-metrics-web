const rethink = require('rethinkdb');
const tableProvider = require('./tableProvider');

const INDEX = { index: 'jobName' };


function getJobs(conn) {
  return tableProvider.getTable()
    .distinct(INDEX)
    .run(conn)
    .then((cursor) => cursor.toArray());
}

function isJobAvailable(conn, jobName) {
  return rethink.not(tableProvider.getTable()
    .getAll(jobName, INDEX)
    .isEmpty())
    .run(conn);
}


module.exports = {
  isJobAvailable,
  getJobs
};
