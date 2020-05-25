// Redis, Redis Time Series and Poisson Process Modules
const redis = require('redis');
const redisTS = require('redistimeseries-js');
const { promisify } = require('util');

// Start Redis server with following options
const redisOpt = {
    host: 'localhost',
    port: 7000
}
const rCli = redis.createClient(redisOpt);
const rtsCli = new redisTS(redisOpt);




/** TESTING REDIS TIME SERIES **/
// Creates time series key in database
const rtsKey = "rtsKey";
var createKey = async () => {
    await rtsCli.connect();
    await rtsCli.create(rtsKey).retention(60000).send();
}

// Benchmarking time series writes
var writeTSValues = async () => {
    await rtsCli.connect();     // Connect client

    var promises = [];          // Array of Promises

    var start = Date.now();

    // Repeatedly write data, add promises to array and then await all
    for(let i=1; i<= 10000; i++){
        promises.push(rtsCli.add(rtsKey, i, i).send());
    }
    await Promise.all(promises);

    var end = Date.now();

    console.log("Time taken for time series writes: " + end-start);
}

// Testing
createKey();
writeTSValues();



/** TESTING REDIS SORTED SETS **/
const zaddKey = 'zaddKey';      // Create ZADD key in database

// Benchmarking ZADDwrites
var writeSSValues = async () => {
    await rtsCli.connect();     // Connect client

    var promises = [];          // Array of Promises
    var ZADD = promisify(rCli.zadd).bind(rCli);    // Promisify "ZADD" action

    var start = Date.now();

    // Repeatedly write data, add promises to array and then await all
    for(let i=1; i<= 10000; i++){
        promises.push(ZADD(zaddKey, i, i));
    }
    await Promise.all(promises);

    var end = Date.now();

    console.log("Time taken for ZADD writes: " + end-start);
}


// Testing
writeSSValues();
