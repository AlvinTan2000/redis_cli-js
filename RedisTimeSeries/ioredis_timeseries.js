/* Redis modules and custom benchmarking module */
const IORedis = require('ioredis');
const {Command} = require('ioredis');
const CB = require('../redis_callbacks');
const {RTSKEY} = require("../redis_benchmarker");
const {REDIS_OPT} = require('../redis_benchmarker')
const {SAMPLE_TIME} = require("../redis_benchmarker");
const {WARMUP_ITERATIONS} = require("../redis_benchmarker");
const {BENCHMARK_ITERATIONS} = require("../redis_benchmarker");
const {redisCommand} = require("../redis_benchmarker");

/* Different command option
*   0 : send_command
*   1 : call
*/
let option = 0;

const redisCli = new IORedis(REDIS_OPT);

function tsadd(offset, iterations, callback) {
    switch (option) {
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
    switch (option) {
        case 0:
            redisCommand(offset, iterations, (i) => {
                redisCli.sendCommand(new Command("TS.RANGE", [RTSKEY, i, i + 1], 'utf-8', () => {
                    CB.redisCB(iterations, callback)
                }))
            });
            break;
        case 1:
            redisCommand(offset, iterations, (i) => {
                redisCli.call("TS.RANGE", [RTSKEY, i, i + 1], 'utf-8', () => {
                    CB.redisCB(iterations, callback)
                });
            })
            break;
    }
}

/* MAIN TESTER */
async function main() {
    await redisCli.call("FLUSHALL", () => console.log("FLUSHED DB \n"))                         // Flush DB
    await redisCli.call("TS.CREATE", [RTSKEY], 'utf-8', () => console.log("CREATED KEY \n"));   // Create Time Series Key

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
    });
}

main();