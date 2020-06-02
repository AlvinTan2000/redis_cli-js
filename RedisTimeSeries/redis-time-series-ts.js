/* Redis modules and custom benchmarking module */
const redisTimeSeriesTs = require('redis-time-series-ts')
const {TimestampRange} = require("../node_modules/redis-time-series-ts/lib/entity/timestampRange");
const {Sample} = require("../node_modules/redis-time-series-ts/lib/entity/sample");
const callback = require('../redis_callbacks');
const benchmarker = require('../redis_benchmarker')
const {SAMPLE_TIME} = require("../redis_benchmarker");
const {RTSKEY} = require("../redis_benchmarker");

/* Initialize redis client */
const factory = new redisTimeSeriesTs.RedisTimeSeriesFactory(benchmarker.REDIS_OPT);
const redisTSCli = factory.create();

/* Create key */
async function redisCreate() {
    await redisTSCli.create(RTSKEY);
}

/* CLIENT ITERATIONS */
function asynchronousTSADD() {
    for (let i = SAMPLE_TIME; i < benchmarker.BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisTSCli.add(new Sample(RTSKEY, i, i)).then(() => callback.addCB(asynchronousTSRANGE)).catch(console.log);
    }
}

function asynchronousTSRANGE() {
    for (let i = SAMPLE_TIME; i < benchmarker.BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        redisTSCli.range(RTSKEY, new TimestampRange(i, i + 1)).then(() => callback.rangeCB()).catch(console.log);
    }
}

/* MAIN TESTER */
async function main() {
    await redisCreate();
    asynchronousTSADD();
}

main();
