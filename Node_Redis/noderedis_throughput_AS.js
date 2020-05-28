const redis = require('redis');
const benchmarker = require('../redis_benchmarker')

const redisOpt = {
    host: 'localhost',
    port: 7000
}
const redisClient = redis.createClient(redisOpt);

const SAMPLE_TIME = 1577836800;
let replyCounter = 0;


/** TESTING REDIS SORTED SETS **/
const ZADDKEY = 'zaddKey';      // Create ZADD key in database

function asynchronousZADD() {
    for (let i = 0; i < benchmarker.BENCHMARK_ITERATIONS; i++) {
        redisClient.zadd(ZADDKEY, i + SAMPLE_TIME, i,
            // Callback to increase reply counter, which stops the timer and print results if last reply
            function (error, result) {
                replyCounter++;
                if (replyCounter >= benchmarker.BENCHMARK_ITERATIONS) {
                    benchmarker.stopClock();
                    benchmarker.printResult(replyCounter);
                    replyCounter = 0 ;
                    benchmarker.startClock();
                    asynchronousZRANGE();
                }
            })
    }
}

function asynchronousZRANGE() {
    for (let i = 0; i < benchmarker.BENCHMARK_ITERATIONS; i++) {
        redisClient.zrange(ZADDKEY, i+SAMPLE_TIME, i+SAMPLE_TIME + 1, 'WITHSCORES',
            function (error, result) {
                replyCounter++;
                if (replyCounter >= benchmarker.BENCHMARK_ITERATIONS) {
                    benchmarker.stopClock();
                    benchmarker.printResult(replyCounter);
                    redisClient.flushall();
                }
            })
    }
}

function main() {
    benchmarker.startClock();
    asynchronousZADD();
}

main();


function testZremForSetLength(setLength, callback) {
    var start = process.hrtime();

    redisClient.eval("redis.call(\"ZADD\", \"test-key\", 1, 1)", 0, 0, function (error, result) {
        console.log(result);
        var end = process.hrtime(start);
        console.info("Execution time for set length of %d: %ds %ds", setLength, end[0], end[1]/1000000000);

        callback();
    });
}

testZremForSetLength(100000, () => {
    process.exit();
});