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
const key = 'testKey';

// // Create key in database
// var createKey = async () => {
//     await rtsCli.connect();
//     await rtsCli.create(key).retention(60000).send();
// }
//
// // Function that repeats Redis actions with specific Poisson mean rate
// var addTSValues = poisson.create(500,async () => {
//     await rtsCli.add(key, Date.now(), 100).send();
//     console.log("test")
// })

var i=0
var addSSValues = poisson.create (500, async () => {
    await rCli.zadd([key, Date.now(), i]);
    i++;
})

addSSValues.start();
setTimeout(function() {
    addSSValues.stop();
    console.log(i);
}, 5000);
//
//
// /******************************/
//
// createKey();
// addTSValues.start();
// setTimeout(function() {
//     addTSValues.stop();
//     console.log("done");
// }, 5000);
//
//
// /******************************/
