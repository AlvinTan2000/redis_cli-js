/* Redis modules and custom benchmarking module */
const Redis = require('redis');
const cb = require('../redis_callbacks');
const benchmarker = require('../redis_benchmarker');
const {SAMPLE_TIME} = require("../redis_benchmarker");
const {WARMUP_ITERATIONS} = require("../redis_benchmarker");
const {BENCHMARK_ITERATIONS} = require("../redis_benchmarker");
const {SSKEY} = require("../redis_benchmarker");
const {promisify} = require('util');

/* Initialize redis client */
const redisCli = Redis.createClient(benchmarker.REDIS_OPT);

/* WARM UP ITERATIONS */
function coldZADD() {
    process.stdout.write("WARMING UP ZADD");
    benchmarker.startClock()
    for (let i = SAMPLE_TIME; i < SAMPLE_TIME + WARMUP_ITERATIONS; i++) {
        redisCli.zadd([SSKEY, i, i], () => cb.redisCB(WARMUP_ITERATIONS, coldZRANGE));
    }
}

function coldZRANGE() {
    process.stdout.write("WARMING UP ZRANGE");
    benchmarker.startClock()
    for (let i = 0; i < WARMUP_ITERATIONS; i++) {
        redisCli.zrange([SSKEY, i, i + 1], () => cb.redisCB(WARMUP_ITERATIONS, warmZADD));
    }
}

/* CLIENT ITERATIONS */
function warmZADD() {
    process.stdout.write("TESTING ZADD");
    benchmarker.startClock()
    for (let i = SAMPLE_TIME + WARMUP_ITERATIONS; i < SAMPLE_TIME + WARMUP_ITERATIONS + BENCHMARK_ITERATIONS; i++) {
        redisCli.zadd([SSKEY, i, i], () => cb.redisCB(BENCHMARK_ITERATIONS, warmZRANGE));
    }
}

function warmZRANGE() {
    process.stdout.write("TESTING ZRANGE");
    benchmarker.startClock()
    for (let i = WARMUP_ITERATIONS; i < WARMUP_ITERATIONS + BENCHMARK_ITERATIONS; i++) {
        redisCli.zrange([SSKEY, i, i + 1], () => cb.redisCB(BENCHMARK_ITERATIONS, process.exit));
    }
}

/* Alternative way of calling ZADD through .send_command()  */
function warmZADDAlt() {
    process.stdout.write("TESTING ZADD");
    benchmarker.startClock()
    for (let i = SAMPLE_TIME; i < BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisCli.send_command("ZADD", [SSKEY, i, i], () => cb.redisCB(BENCHMARK_ITERATIONS, warmZRANGEAlt));
    }
}

function warmZRANGEAlt() {
    process.stdout.write("TESTING ZRANGE");
    benchmarker.startClock()
    for (let i = SAMPLE_TIME; i < BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisCli.send_command("ZRANGE", [SSKEY, i, i + 1, 'WITHSCORES'], () => cb.redisCB(BENCHMARK_ITERATIONS, process.exit));
    }
}

async function flushDB() {
    /* Promisify ZADD */
    let FLUSHALL = promisify(redisCli.flushall).bind(redisCli);
    await FLUSHALL().then(console.log("FLUSHED DB.\n"));
}
flushDB();


/* MAIN TESTER */
coldZADD();