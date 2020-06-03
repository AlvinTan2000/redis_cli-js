/* Redis modules and custom benchmarking module */
const Redis = require('redis');
const callback = require('../redis_callbacks');
const benchmarker = require('../redis_benchmarker');
const {SAMPLE_TIME} = require("../redis_benchmarker");
const {ZADDKEY} = require("../redis_benchmarker");

/* Initialize redis client */
const redisCli = Redis.createClient(benchmarker.REDIS_OPT);

/* CLIENT ITERATIONS */
function asynchronousZADD() {
    for (let i = SAMPLE_TIME; i < benchmarker.BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisCli.zadd(ZADDKEY, i, i, () => callback.addCB(asynchronousZRANGE));
    }
}
function asynchronousZRANGE() {
    for (let i = 0; i < benchmarker.BENCHMARK_ITERATIONS; i++) {
        redisCli.zrange(ZADDKEY, i, i + 1, () => callback.rangeCB());
    }
}

/* Alternative way of calling ZADD through .send_command()  */
function asynchronousZADDAlt() {
    for (let i = SAMPLE_TIME; i < benchmarker.BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisCli.send_command("ZADD", [ZADDKEY, i, i], () => callback.addCB(asynchronousZRANGEAlt()));
    }
}
function asynchronousZRANGEAlt() {
    for (let i = SAMPLE_TIME; i < benchmarker.BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisCli.send_command("ZRANGE", [ZADDKEY, i, i+1,'WITHSCORES'], () => callback.rangeCB());
    }
}

/* MAIN TESTER */
function main() {
    redisCli.flushall();
    asynchronousZADD();
}

main();