/* Redis modules and custom benchmarking module */
const redisTS = require('redistimeseries-js');
const callback = require('../redis_callbacks');
const benchmarker = require('../redis_benchmarker')
const {SAMPLE_TIME} = require("../redis_benchmarker");
const {RTSKEY} = require("../redis_benchmarker");

/* Initialize redis client */
const redisTSCli = new redisTS(benchmarker.REDIS_OPT);

/* Connect to Redis and create key */
async function redisConnectandCreate() {
    await redisTSCli.connect();
    await redisTSCli.create(RTSKEY).send();
}

/* CLIENT ITERATIONS */
function asynchronousTSADD() {
    for (let i = SAMPLE_TIME; i < benchmarker.BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisTSCli.add(RTSKEY, i, i).send().then(() => callback.addCB(asynchronousTSRANGE)).catch(console.log);
    }
}

function asynchronousTSRANGE() {
    for (let i = SAMPLE_TIME; i < benchmarker.BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisTSCli.range(RTSKEY, i, i + 1).send().then(() => callback.rangeCB()).catch(console.log);
    }
}


/* MAIN TESTER */
async function main() {
    await redisConnectandCreate();
    asynchronousTSADD();
}

main();