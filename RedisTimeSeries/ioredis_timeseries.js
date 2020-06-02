/* Redis modules and custom benchmarking module */
const IORedis = require('ioredis');
const {Command} = require('ioredis');
const callback = require('../redis_callbacks');
const benchmarker = require('../redis_benchmarker')
const {SAMPLE_TIME} = require("../redis_benchmarker");
const {RTSKEY} = require("../redis_benchmarker");

/* Initialize Client */
const redisCli = new IORedis(benchmarker.REDIS_OPT);

/* Create TS key */
function redisCreate() {
    redisCli.send_command("TS.CREATE", [RTSKEY], 'utf-8');
}

/* CLIENT ITERATIONS */
function asynchronousTSADD() {
    for (let i = SAMPLE_TIME; i < benchmarker.BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisCli.sendCommand(new Command("TS.ADD", [RTSKEY, i, i], 'utf-8', () => callback.addCB(asynchronousTSRANGE)));
    }
}

function asynchronousTSRANGE() {
    for (let i = SAMPLE_TIME; i < benchmarker.BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisCli.sendCommand(new Command("TS.RANGE", [RTSKEY, i, i+1], 'utf-8', () => callback.rangeCB()));
    }
}

/* Alternative method using .call() */
function asynchronousTSADDAlt() {
    for (let i = SAMPLE_TIME; i < benchmarker.BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisCli.call("TS.ADD", [RTSKEY, i, i], 'utf-8', () => callback.addCB(asynchronousTSRANGEAlt));
    }
}

function asynchronousTSRANGEAlt() {
    for (let i = SAMPLE_TIME; i < benchmarker.BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisCli.call("TS.RANGE", [RTSKEY, i, i+1], 'utf-8', () => callback.rangeCB());
    }
}


/* MAIN TESTER */
function main() {
    redisCli.flushall();
    redisCreate();
    asynchronousTSADD();
}

main();