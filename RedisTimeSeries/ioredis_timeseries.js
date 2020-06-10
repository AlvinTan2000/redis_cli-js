/* Redis modules and custom benchmarking module */
const IORedis = require('ioredis');
const {Command} = require('ioredis');
const CB = require('../redis_callbacks');
const Benchmarker = require('../redis_benchmarker')
const {RTSKEY} = require("../redis_benchmarker");
const {SAMPLE_TIME} = require("../redis_benchmarker");
const {WARMUP_ITERATIONS} = require("../redis_benchmarker");
const {BENCHMARK_ITERATIONS} = require("../redis_benchmarker");
const {redisCommand} = require("../redis_benchmarker");

let option = 0;

/* Initialize Client */
const redisCli = new IORedis(Benchmarker.REDIS_OPT);

/* Create TS key */
async function redisCreate() {
    await redisCli.call("TS.CREATE", [RTSKEY], 'utf-8');
}

function tsadd(offset, iterations, callback) {
    switch (option){
        case 0:
            redisCommand(offset, iterations, (i) => {
                redisCli.sendCommand(new Command("TS.ADD", [RTSKEY, i, i], 'utf-8', () => {
                    CB.redisCB(iterations, callback)
                }));
            })
            break;

        case 1:
            redisCommand(offset, iterations, (i) => {
                redisCli.call("TS.ADD", [RTSKEY, i, i], 'utf-8', () => {
                    CB.redisCB(iterations, callback)
                });
            })
            break;
    }
}

function tsrange(offset, iterations, callback) {
    switch (option){
        case 0:
            redisCommand(offset, iterations, (i) => {
                redisCli.sendCommand(new Command("TS.RANGE", [RTSKEY, i, i+1], 'utf-8', () => {
                    CB.redisCB(iterations, callback)
                }))
            });
            break;

        case 1:
            redisCommand(offset, iterations, (i) => {
                redisCli.call("TS.RANGE", [RTSKEY, i, i+1], 'utf-8', () => {
                    CB.redisCB(iterations, callback)
                });
            })
            break;
    }

}

/* MAIN TESTER */
async function main() {
    await redisCli.call("FLUSHALL", () => console.log("FLUSHED DB.\n"))
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
}

main();