/* Redis modules and custom benchmarking module */
const IORedis = require('ioredis');
const {Command} = require('ioredis');
const callback = require('../redis_callbacks');
const benchmarker = require('../redis_benchmarker')
const {SAMPLE_TIME} = require("../redis_benchmarker");
const {ZADDKEY} = require("../redis_benchmarker");

/* Initialize redis client */
const redisCli = new IORedis(benchmarker.REDIS_OPT);

/* CLIENT ITERATIONS */
function asynchronousZADD() {
    for (let i = SAMPLE_TIME; i < benchmarker.BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisCli.zadd(ZADDKEY, i, i, () => callback.addCB(asynchronousZRANGE));
    }
}

function asynchronousZRANGE() {
    for (let i = 0; i < benchmarker.BENCHMARK_ITERATIONS; i++) {
        redisCli.zrange(ZADDKEY, i, i + 1, 'WITHSCORES', () => callback.rangeCB());
    }
}

/* Alternative method using .sendCommand() */
function asynchronousZADDAlt() {
    for (let i = SAMPLE_TIME; i < benchmarker.BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisCli.sendCommand(new Command("ZADD", [ZADDKEY, i, i], 'utf-8', () => callback.addCB(asynchronousZRANGEAlt)));
    }
}

function asynchronousZRANGEAlt() {
    for (let i = 0; i < benchmarker.BENCHMARK_ITERATIONS; i++) {
        redisCli.sendCommand(new Command("ZRANGE", [ZADDKEY, i, i+1,'WITHSCORES'], 'utf-8', () => callback.rangeCB()));
    }
}

/* Alternative method using .call() */
function asynchronousZADDAlt2() {
    for (let i = SAMPLE_TIME; i < benchmarker.BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisCli.call("ZADD", [ZADDKEY, i, i], () => callback.addCB(asynchronousZRANGEAlt2));
    }
}

function asynchronousZRANGEAlt2() {
    for (let i = 0; i < benchmarker.BENCHMARK_ITERATIONS; i++) {
        redisCli.call("ZRANGE", [ZADDKEY, i, i+1,'WITHSCORES'], ()=>callback.rangeCB());
    }
}


/* MAIN TESTER */
function main() {
    redisCli.flushall();
    asynchronousZADDAlt();
}

main();