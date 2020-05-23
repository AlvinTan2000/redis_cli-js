// Redis, Redis Time Series and Poisson Process Modules
const redis = require('redis');
const redisTS = require('redistimeseries-js');

// Start Redis server with following options
const redisOpt = {
    host: 'localhost',
    port: 7000
}
const rCli = redis.createClient(redisOpt);
const rtsCli = new redisTS(redisOpt);

// Create a key
const rtsKey = "rtsKey";


/** TESTING REDIS TIME SERIES **/

// Create key in database
var createKey = async () => {
    await rtsCli.connect();
    await rtsCli.create(rtsKey).retention(60000).send();
}



// Function that repeats Redis actions with specific Poisson mean rate
var addTSValues = async () => {
    await rtsCli.connect();

    var start = Date.now();
    for(let i=1; i< 5000; i++){
        rtsCli.add(rtsKey, i, i).send();
    }

    var end = Date.now();

    var reply = await rtsCli.info(rtsKey).send();
    console.log(end-start);
}


// Testing
createKey();
addTSValues();