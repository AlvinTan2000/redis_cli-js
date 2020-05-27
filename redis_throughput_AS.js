const redis = require('redis');
const benchmarker = require('./redis_benchmarker')

const redisOpt = {
    host: 'localhost',
    port: 7000
}
const redisClient = redis.createClient(redisOpt);

const SAMPLE_TIME = 1577836800;
let replyCounter = 0;


/** TESTING REDIS SORTED SETS **/
const ZADDKEY = 'zaddKey';      // Create ZADD key in database

async function asynchronousZADD() {
    for (let i = 0; i < benchmarker.BENCHMARK_ITERATIONS; i++) {
        redisClient.zadd(ZADDKEY, i + SAMPLE_TIME, i,
            // Callback to increase reply counter, which stops the timer and print results if last reply
            function (error, result) {
                if (replyCounter === 0) {
                    benchmarker.startClock();
                }
                replyCounter++;
                if (replyCounter >= benchmarker.BENCHMARK_ITERATIONS) {
                    benchmarker.stopClock();
                    benchmarker.printResult(replyCounter);
                }
            })
    }
}

function asynchronousZRANGE() {
    for (let i = 0; i < benchmarker.BENCHMARK_ITERATIONS; i++) {
        redisClient.zrange(ZADDKEY, i, i + 1, function (error, result) {
            if (replyCounter === 0) {
                benchmarker.startClock();
            }
            replyCounter++;
            if (replyCounter >= benchmarker.BENCHMARK_ITERATIONS) {
                benchmarker.stopClock();
                benchmarker.printResult(replyCounter);
            }
        })
    }
}


function main() {
    asynchronousZRANGE();
}

main();