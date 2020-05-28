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
        benchmarker.startClock();
    for (let i = 0; i < benchmarker.BENCHMARK_ITERATIONS; i++) {
        redisClient.eval("redis.call(\"ZADD\", \""+ZADDKEY+"\"," +i+","+i+")", 0, 0,
        // redisClient.zadd(ZADDKEY, i + SAMPLE_TIME, i,
        //     Callback to increase reply counter, which stops the timer and print results if last reply
            function (error, result) {
            // if (replyCounter==0){
            //     benchmarker.startClock();
            //
            // }
                replyCounter++;
                if (replyCounter >= benchmarker.BENCHMARK_ITERATIONS) {
                    benchmarker.stopClock();
                    benchmarker.printResult(replyCounter);
                    replyCounter = 0 ;
                    asynchronousZRANGE();
                }
            })
    }
}

function asynchronousZRANGE() {
        benchmarker.startClock();
    for (let i = 0; i < benchmarker.BENCHMARK_ITERATIONS; i++) {
        redisClient.zrange(ZADDKEY, i+SAMPLE_TIME, i+SAMPLE_TIME + 1, 'WITHSCORES',
            function (error, result) {
                // if (replyCounter==0){
                //     benchmarker.startClock();
                // }
                replyCounter++;
                if (replyCounter >= benchmarker.BENCHMARK_ITERATIONS) {
                    benchmarker.stopClock();
                    benchmarker.printResult(replyCounter);
                }
            })
    }
}

function main() {
    redisClient.flushall();
    asynchronousZADD();
}

main();