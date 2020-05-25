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


const sampleTime = 1577836800;

/** TESTING REDIS TIME SERIES **/
// Creates time series key in database
const rtsKey = "rtsKey";
const createKey = async () => {
    await rtsCli.connect();
    await rtsCli.create(rtsKey).retention(60000).send();
};

// Benchmarking time series writes
const writeTSValues = async () => {
    await rtsCli.connect();     // Connect client

    let promises = [];          // Array of Promises

    let start = Date.now();

    // Repeatedly write data, add promises to array and then await all
    for (let i = sampleTime; i <= sampleTime + 500; i++) {
        promises.push(rtsCli.add(rtsKey, i, i).send());
    }
    await Promise.all(promises);

    let end = Date.now();

    console.log("Time taken for time series writes: " + (end - start));
};

// Benchmarking time series reads
const readTSValues = async () => {
    await rtsCli.connect();     // Connect client

    let promises = [];          // Array of Promises

    let start = Date.now();

    // Repeatedly write data, add promises to array and then await all
    for (let i = sampleTime; i <= sampleTime + 500; i++) {
        promises.push(rtsCli.range(rtsKey, 0, i).send());
    }
    await Promise.all(promises);

    let end = Date.now();

    console.log("Time taken for time series read: " + (end - start));
};


/** TESTING REDIS SORTED SETS **/
const zaddKey = 'zaddKey';      // Create ZADD key in database

// Benchmarking ZADD writes
const writeSSValues = async () => {
    await rtsCli.connect();     // Connect client

    let promises = [];          // Array of Promises
    let ZADD = promisify(rCli.zadd).bind(rCli);    // Promisify "ZADD" action

    let start = Date.now();

    // Repeatedly write data, add promises to array and then await all
    for (let i = sampleTime; i <= sampleTime + 500; i++) {
        promises.push(ZADD(zaddKey, i, i));
    }
    await Promise.all(promises);

    let end = Date.now();

    console.log("Time taken for ZADD writes: " + (end - start));
};

// Benchmarking ZADD reads
var readSSValues = async () => {
    await rtsCli.connect();         // Connect client

    let promises = [];          // Array of Promises
    let ZRANGE = promisify(rCli.zrange).bind(rCli);    // Promisify "ZADD" action

    let start = Date.now();

    // Repeatedly read data, add promises to array and then await all
    for (let i = sampleTime; i <= sampleTime + 500; i++) {
        promises.push(ZRANGE(zaddKey, 0, i));
    }
    await Promise.all(promises);

    let end = Date.now();
z
    console.log("Time taken for ZADD writes: " + (end-start));
}


// Testing
const benchmark = async () => {
    await createKey();
    await writeTSValues();
    await readTSValues();
    await writeSSValues();
    await readSSValues()
};

benchmark().then();