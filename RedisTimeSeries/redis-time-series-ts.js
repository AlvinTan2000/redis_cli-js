/* Redis modules and custom benchmarking module */
const Redis = require('redis');
const redisTimeSeriesTs = require('redis-time-series-ts')
const {TimestampRange} = require("../node_modules/redis-time-series-ts/lib/entity/timestampRange");
const {Sample} = require("../node_modules/redis-time-series-ts/lib/entity/sample");
const CB = require('../redis_callbacks');
const Benchmarker = require('../redis_benchmarker')
const {RTSKEY} = require("../redis_benchmarker");
const {SAMPLE_TIME} = require("../redis_benchmarker");
const {WARMUP_ITERATIONS} = require("../redis_benchmarker");
const {BENCHMARK_ITERATIONS} = require("../redis_benchmarker");
const {redisCommand} = require("../redis_benchmarker");

/* Initialize redis client */
const factory = new redisTimeSeriesTs.RedisTimeSeriesFactory(Benchmarker.REDIS_OPT);
const redisTSCli = factory.create();
const redisCli = Redis.createClient(Benchmarker.REDIS_OPT);


/* Create key */
async function redisCreate() {
    await redisTSCli.create(RTSKEY);
}

function tsadd(offset, iterations, callback) {
    redisCommand(offset, iterations, (i) => {
        redisTSCli.add(new Sample(RTSKEY, i, i)).then(() => {
            CB.redisCB(iterations, callback)
        });
    })
}

function tsrange(offset, iterations, callback) {
    redisCommand(offset, iterations, (i) => {
        redisTSCli.range(RTSKEY, new TimestampRange(i, i + 1)).then(() => {
            CB.redisCB(iterations, callback)
        })
    });
}

/* MAIN TESTER */
async function main() {
    console.log("FLUSHED \n")
    redisCli.flushall(async () => {
        await redisCreate();
        console.log("CREATED KEY \n")
        process.stdout.write("WARM UP TSADD");
        tsadd(SAMPLE_TIME, WARMUP_ITERATIONS, () => {
            process.stdout.write("WARM UP TSRANGE");
            tsrange(SAMPLE_TIME, WARMUP_ITERATIONS, async () => {
                process.stdout.write("TESTING TSADD");
                tsadd(SAMPLE_TIME + WARMUP_ITERATIONS, BENCHMARK_ITERATIONS, () => {
                    process.stdout.write("TESTING TSRANGE");
                    tsrange(SAMPLE_TIME + WARMUP_ITERATIONS, BENCHMARK_ITERATIONS, process.exit)
                })
            })
        })
    });
}

main();
