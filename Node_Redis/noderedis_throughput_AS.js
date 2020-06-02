/* Redis modules and custom benchmarking module */
const Redis = require('redis');
const benchmarker = require('../redis_benchmarker');
const {SAMPLE_TIME} = require("../redis_benchmarker");
const {ZADDKEY} = require("../redis_benchmarker");

/* Initialize redis client */
const redisCli = Redis.createClient(benchmarker.REDIS_OPT);

/* Read and write counter for determining last callback */
let writeCounter = 0;
let readCounter = 0;

/* CALLBACKS */
function zaddCB() {
    if (writeCounter === 0) {
        benchmarker.startClock();
    }
    writeCounter++;
    if (writeCounter >= benchmarker.BENCHMARK_ITERATIONS) {
        benchmarker.stopClock();
        benchmarker.printResult(writeCounter);
        asynchronousZRANGE();
    }
}
function zrangeCB() {
    if (readCounter === 0) {
        benchmarker.startClock();
    }
    readCounter++;
    if (readCounter >= benchmarker.BENCHMARK_ITERATIONS) {
        benchmarker.stopClock();
        benchmarker.printResult(writeCounter);
    }
}


/* CLIENT ITERATIONS */
function asynchronousZADD() {
    for (let i = SAMPLE_TIME; i < benchmarker.BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisCli.zadd(ZADDKEY, i, i, zaddCB);
    }
}
/* Alternative way of calling ZADD through .eval() */
// function asynchronousZADDAlt() {
//     for (let i = SAMPLE_TIME; i < benchmarker.BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
//         redisCli.eval("redis.call(\"ZADD\", \"" + ZADDKEY + "\"," + i + "," + i + ")", 0, 0,zaddCB);
//     }
// }
function asynchronousZRANGE() {
    for (let i = 0; i < benchmarker.BENCHMARK_ITERATIONS; i++) {
        redisCli.zrange(ZADDKEY, i, i+1, zrangeCB);
    }
}


/* MAIN TESTER */
function main() {
    redisCli.flushall();
    asynchronousZADD();
}

main();