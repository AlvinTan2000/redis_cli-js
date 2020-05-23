// Redis, Redis Time Series and Poisson Process Modules
const redis = require('redis');
const redisTS = require('redistimeseries-js');
const poisson = require('poisson-process');

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

var rts = 1;
// Function that repeats Redis actions with specific Poisson mean rate
var addTSValues = poisson.create(10,async () => {
    rtsCli.add(rtsKey, rts, 100).send().then().catch(function () {
        console.log("problem")
    });
    rts ++;
})


// Testing
createKey();
addTSValues.start();
setTimeout(function() {
    addTSValues.stop();
    console.log("Amount of TS.ADDs: " + rts);
}, 5000);



/** TESTING REDIS SORTED SETS **/

var rss = 1;
var addSSValues = poisson.create (10, async () => {
    await rCli.zadd(['zaddKey', Date.now(), rss]);
    rss++;
})

addSSValues.start();
setTimeout(function() {
    addSSValues.stop();
    console.log("Amount oft ZADDs: " + rss);
}, 5000);


/** Reset **/
