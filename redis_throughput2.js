const redis = require('redis');
const redisTS = require('redistimeseries-js');
const benchmarker = require('./benchmarker')

const SAMPLE_TIME = 1577836800;
const HOST = 'localhost';
const PORT = 7000;

let msgout =0;
let msgin = 0;
let finished = false;

// Start Redis server with following options
const redisOpt = {
    host: HOST,
    port: PORT
}
const rCli = redis.createClient(redisOpt);


/** TESTING REDIS SORTED SETS **/
const zaddKey = 'zaddKey';      // Create ZADD key in database

// Benchmarking ZADD writes
function writeSSValues () {
    if (!finished) {
        rCli.zadd(zaddKey,msgout, msgout, function(error, result){
            msgin++;
            if (msgin >= benchmarker.BENCHMARK_ITERATIONS) {
                finished = true;
            }
        })
        msgout++;
        setTimeout(writeSSValues, 1);
    } else {
        benchmarker.stopClock();
        benchmarker.printResult(msgin);
    }
}

// Benchmarking ZADD reads
function readSSValues () {
    for(let msgout = 0 ; msgout < benchmarker.BENCHMARK_ITERATIONS; msgout++){
            rCli.zrange(zaddKey, msgout, msgout, function (error, result) {
                if (msgin == 0){
                    console.log("start");
                    benchmarker.startClock();
                }
                console.log(result);
                msgin++;
                if (msgin >= benchmarker.BENCHMARK_ITERATIONS) {
                    finished = true;
                    benchmarker.stopClock();
                    benchmarker.printResult(msgin);
                }
            })
    }
}


function main () {
        readSSValues();
}

main();