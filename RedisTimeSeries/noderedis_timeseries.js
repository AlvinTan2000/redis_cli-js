const redis = require('redis');
const callback = require('../redis_callbacks');
const benchmarker = require('../redis_benchmarker')
const {SAMPLE_TIME} = require("../redis_benchmarker");
const {RTSKEY} = require("../redis_benchmarker");

/* Initialize Client */
const redisCli = redis.createClient(benchmarker.REDIS_OPT);

/* Create TS key */
function redisCreate() {
    redisCli.send_command("TS.CREATE", [RTSKEY]);
}

/* CLIENT ITERATIONS */
function asynchronousTSADD() {
    for (let i = SAMPLE_TIME; i < benchmarker.BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisCli.send_command("TS.ADD", [RTSKEY, i, i], () => callback.addCB(asynchronousTSRANGE));
    }
}

function asynchronousTSRANGE() {
    for (let i = SAMPLE_TIME; i < benchmarker.BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisCli.send_command("TS.RANGE", [RTSKEY, i, i], () => callback.rangeCB());
    }
}

/* MAIN TESTER */
function main() {
    redisCli.flushall();
    redisCreate();
    asynchronousTSADD();
}

main();