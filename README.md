# jenkins-metrics-web
NodeJS application to visualize Jenkins metrics collected by [jenkins-metrics-collector](https://github.com/TOPdesk/jenkins-metrics-collector).

## Requirements
Tested on NodeJS v4 and v5.
Uses [RethinkDB](https://www.rethinkdb.com) with data from [jenkins-metrics-collector](https://github.com/TOPdesk/jenkins-metrics-collector).  
 
## Installation
Running `npm install` will get all dependencies - including bower for client.

## Configuration
Put your configuration to `config/default.json` 
For detailed config file naming conventions see Loren West's [node-config](https://github.com/lorenwest/node-config/wiki/Configuration-Files).
````json
{
  "server": {
    "port": 3000
  },
  "database": {
    "host": "localhost",
    "port": 28015,
    "authKey": "",
    "name": "jenkins_metrics"
  },
  "statistics": {
    "executionTime": {
      "earliestBatchLimitPercent": 10,
      "latestBatchLimitPercent": 10
    },
    "executionResults": {
      "earliestBatchLimitPercent": 10,
      "latestBatchLimitPercent": 10
    },
    "testResults": {
      "earliestBatchLimitPercent": 10,
      "latestBatchLimitPercent": 10
    }
  }
}
````

