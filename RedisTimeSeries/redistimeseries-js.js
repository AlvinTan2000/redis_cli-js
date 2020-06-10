/* Redis modules and custom benchmarking module */
const RedisTS = require('redistimeseries-js');
const Redis = require('redis');
const CB = require('../redis_callbacks');
const Benchmarker = require('../redis_benchmarker')
const {RTSKEY} = require("../redis_benchmarker");
const {SAMPLE_TIME} = require("../redis_benchmarker");
const {WARMUP_ITERATIONS} = require("../redis_benchmarker");
const {BENCHMARK_ITERATIONS} = require("../redis_benchmarker");
const {redisCommand} = require("../redis_benchmarker");

/* Initialize redis client */
const redisCli = Redis.createClient(Benchmarker.REDIS_OPT);
const redisTSCli = new RedisTS(Benchmarker.REDIS_OPT);

/* Connect to Redis and create key */
async function redisConnectandCreate() {
    await redisTSCli.connect();
    await redisTSCli.create(RTSKEY).send();
}

function tsadd(offset, iterations, callback) {
    redisCommand(offset, iterations, (i) => {
        redisTSCli.add(RTSKEY, i, i).send().then(() => {
            CB.redisCB(iterations, callback)
        });
    })
}

function tsrange(offset, iterations, callback) {
    redisCommand(offset, iterations, (i) => {
        redisTSCli.range(RTSKEY, i, i + 1).send().then( () => {
            CB.redisCB(iterations, callback)
        })
    });
}

/* MAIN TESTER */
async function main() {
    console.log("FLUSHED \n")
    redisCli.flushall(async () => {
            await redisConnectandCreate();
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