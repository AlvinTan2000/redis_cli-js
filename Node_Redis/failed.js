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
function writeTSValues () {
    let promises = [];          // Array of Promises

    // Repeatedly write data and add promises to array
    for (let i = sampleTime; i <= sampleTime + 500; i++) {
        promises.push(rtsCli.add(rtsKey, i, i).send());
    }
    return promises
};

// Benchmarking time series reads
function readTSValues () {
    let promises = [];          // Array of Promises

    // Repeatedly write data and add promises to array
    for (let i = sampleTime; i <= sampleTime + 500; i++) {
        promises.push(rtsCli.range(rtsKey, 0, i).send());
    }
    return promises;
};


/** TESTING REDIS SORTED SETS **/
const zaddKey = 'zaddKey';      // Create ZADD key in database

// Benchmarking ZADD writes
function writeSSValues () {
    let promises = [];          // Array of Promises
    let ZADD = promisify(rCli.zadd).bind(rCli);    // Promisify "ZADD" action

    // Repeatedly write data, add promises to array and then await all
    for (let i = sampleTime; i <= sampleTime + 500; i++) {
        promises.push(ZADD(zaddKey, i, i));
    }
    return promises;
}

// Benchmarking ZADD reads
function readSSValues () {
    let promises = [];          // Array of Promises
    let ZRANGE = promisify(rCli.zrange).bind(rCli);    // Promisify "ZADD" action

    let start = Date.now();

    // Repeatedly read data, add promises to array and then await all
    for (let i = sampleTime; i <= sampleTime + 500; i++) {
        promises.push(ZRANGE(zaddKey, 0, i));
    }

    return promises;
}


const benchmark = async () => {

    let start;
    let end;

    await createKey();

    start = Date.now();
    let writeTS = writeTSValues();
    await Promise.all(writeTS);
    end = Date.now();
    console.log("Time taken for TS writes: " + (end-start));

    start = Date.now();
    let readTS = readTSValues();
    await Promise.all(readTS);
    end = Date.now();
    console.log("Time taken for TS reads: " + (end-start));

    start = Date.now();
    let writeSS = writeSSValues();
    await Promise.all(writeSS);
    end = Date.now();
    console.log("Time taken for ZADD writes: " + (end-start));

    start = Date.now();
    let readSS = readSSValues();
    await Promise.all(readSS);
    end = Date.now();
    console.log("Time taken for ZADD reads: " + (end-start));

};

benchmark().then();