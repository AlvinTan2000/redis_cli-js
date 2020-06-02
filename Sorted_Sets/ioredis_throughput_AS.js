/* Redis modules and custom benchmarking module */
const IORedis = require('ioredis');
const benchmarker = require('../redis_benchmarker')
const {SAMPLE_TIME} = require("../redis_benchmarker");
const {ZADDKEY} = require("../redis_benchmarker");

/* Initialize redis client */
const redisCli = new IORedis(benchmarker.REDIS_OPT);

/* Read and write counter for determining last callback */
let writeCounter = 0;
let readCounter = 0;

/* CALLBACKS */
function zaddCB() {
    /* Start timer upon first callback */
    if (writeCounter === 0) {
        benchmarker.startClock();
    }
    writeCounter++;
    /* End timer upon last callback */
    if (writeCounter >= benchmarker.BENCHMARK_ITERATIONS) {
        benchmarker.stopClock();
        benchmarker.printResult(writeCounter);
        asynchronousZRANGE();
    }
}

function zrangeCB() {
    /* Start timer upon first callback */
    if (readCounter === 0) {
        benchmarker.startClock();
    }
    readCounter++;
    /* End timer upon last callback */
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

function asynchronousZRANGE() {
    for (let i = 0; i < benchmarker.BENCHMARK_ITERATIONS; i++) {
        redisCli.zrange(ZADDKEY, i, i + 1, zrangeCB);
    }
}

/* MAIN TESTER */
function main() {
    redisCli.flushall();
    asynchronousZADD();
}

main();