/* Redis modules and custom benchmarking module */
const Redis = require('redis');
const CB = require('../redis_callbacks');
const {RTSKEY} = require("../redis_benchmarker");
const {REDIS_OPT} = require('../redis_benchmarker')
const {SAMPLE_TIME} = require("../redis_benchmarker");
const {WARMUP_ITERATIONS} = require("../redis_benchmarker");
const {BENCHMARK_ITERATIONS} = require("../redis_benchmarker");
const {redisCommand} = require("../redis_benchmarker");

const redisCli = Redis.createClient(REDIS_OPT);

function tsadd(offset, iterations, callback) {
    redisCommand(offset, iterations, (i) => {
        redisCli.send_command("TS.ADD", [RTSKEY, i, i], () => {
            CB.redisCB(iterations, callback)
        });
    })
}

function tsrange(offset, iterations, callback) {
    redisCommand(offset, iterations, (i) => {
        redisCli.send_command("TS.RANGE", [RTSKEY, i, i + 1], () => {
            CB.redisCB(iterations, callback)
        })
    });
}


/* MAIN TESTER */
async function main() {
    redisCli.flushall(() => {
        console.log("FLUSHED \n")

        redisCli.send_command("TS.CREATE", [RTSKEY], () => {
            console.log("CREATED KEY \n")

            process.stdout.write("WARM UP TSADD");
            tsadd(SAMPLE_TIME, WARMUP_ITERATIONS,  () => {

                process.stdout.write("WARM UP TSRANGE");
                tsrange(SAMPLE_TIME, WARMUP_ITERATIONS, () => {

                    process.stdout.write("TESTING TSADD");
                    tsadd(SAMPLE_TIME + WARMUP_ITERATIONS, BENCHMARK_ITERATIONS, () => {

                        process.stdout.write("TESTING TSRANGE");
                        tsrange(SAMPLE_TIME + WARMUP_ITERATIONS, BENCHMARK_ITERATIONS, process.exit)
                    })
                })
            })
        })
    });
}

main();
