/* Redis and util library + custom callbacks and benchmarking module */
const Redis = require('redis');
const cb = require('../redis_promise_callbacks');
const benchmarker = require('../redis_benchmarker');
const {SAMPLE_TIME} = require("../redis_benchmarker");
const {SSKEY} = require("../redis_benchmarker");
const {promisify} = require('util');

/* Initialize redis client */
const rCli = Redis.createClient(benchmarker.REDIS_OPT);
let FLUSHALL = promisify(rCli.flushall).bind(rCli);    // Promisify ZADD
let ZADD = promisify(rCli.zadd).bind(rCli);    // Promisify ZADD
let ZRANGE = promisify(rCli.zrange).bind(rCli);     // Promisify "ZADD" action


/* CLIENT ITERATIONS */
async function zaddVal(offset, iterations) {
    let promises = [];                             // Array of Promises

    benchmarker.startClock();

    // Iteratively push ZADD promises to array
    for (let i = offset; i < offset + iterations; i++) {
        promises.push(ZADD(SSKEY, i, i,).catch(console.log));
    }
    await Promise.all(promises);

    benchmarker.stopClock();
    benchmarker.printResult();
}

async function zrangeVal(offset, iterations) {
    let promises = [];                                  // Array of Promises

    benchmarker.startClock();

    // Repeatedly read data, add promises to array and then await all
    for (let i = offset; i < offset+iterations; i++) {
        promises.push(ZRANGE(SSKEY, i, i + 1).catch(console.log));
    }
    await Promise.all(promises);

    benchmarker.stopClock();
    benchmarker.printResult();
}


async function main() {
    await FLUSHALL();

    process.stdout.write("WARMING UP WRITE THROUGHPUT")
    await zaddVal(SAMPLE_TIME, benchmarker.WARMUP_ITERATIONS);
    cb.resetCB();

    process.stdout.write("WARMING UP READ THROUGHPUT")
    await zrangeVal(0, benchmarker.WARMUP_ITERATIONS);
    console.log("\x1b[0m");
    cb.resetCB();

    process.stdout.write("TESTING SORTED SETS WRITE THROUGHPUT")
    await zaddVal(SAMPLE_TIME+benchmarker.WARMUP_ITERATIONS, benchmarker.BENCHMARK_ITERATIONS);
    console.log("\x1b[0m");
    cb.resetCB();

    process.stdout.write("TESTING SORTED SETS READ THROUGHPUT")
    await zrangeVal(benchmarker.WARMUP_ITERATIONS, benchmarker.BENCHMARK_ITERATIONS);
    console.log("\x1b[0m");
    cb.resetCB();

    process.exit(1);
}

main();