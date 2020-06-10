/* Redis modules and custom benchmarking module */
const IORedis = require('ioredis');
const {Command} = require('ioredis');
const CB = require('../redis_callbacks');
const Benchmarker = require('../redis_benchmarker');
const {SSKEY} = require("../redis_benchmarker");
const {SAMPLE_TIME} = require("../redis_benchmarker");
const {WARMUP_ITERATIONS} = require("../redis_benchmarker");
const {BENCHMARK_ITERATIONS} = require("../redis_benchmarker");
const {redisCommand} = require("../redis_benchmarker");

/* Different command option
*   0 : zadd / zrange
*   1 : send_command
*   2 : call
*/
const option = 0;

const redisCli = new IORedis(Benchmarker.REDIS_OPT);

function zadd(offset, iterations, callback) {
    switch (option) {
        case 0:
            redisCommand(offset, iterations, (i) => {
                redisCli.zadd([SSKEY, i, i], () => {
                    CB.redisCB(iterations, callback)
                });
            })
            break;

        case 1:
            redisCommand(offset, iterations, (i) => {
                redisCli.sendCommand(new Command("ZADD", [SSKEY, i, i], 'utf-8', () => {
                    CB.redisCB(iterations, callback)
                }))
            });
            break;

        case 2:
            redisCommand(offset, iterations, (i) => {
                redisCli.call("ZADD", [SSKEY, i, i], () => {
                    CB.redisCB(iterations, callback)
                })
            });
            break;
    }
}

function zrange(offset, iterations, callback) {
    switch (option) {
        case 0:
            redisCommand(offset, iterations, (i) => {
                redisCli.zrange([SSKEY, i, i + 1], () => {
                    CB.redisCB(iterations, callback)
                })
            });
            break;

        case 1:
            redisCommand(offset, iterations, (i) => {
                redisCli.sendCommand(new Command("ZRANGE", [SSKEY, i, i + 1], 'utf-8', () => {
                    CB.redisCB(iterations, callback)
                }))
            });
            break;

        case 2:
            redisCommand(offset, iterations, (i) => {
                redisCli.call("ZRANGE", [SSKEY, i, i + 1], () => {
                    CB.redisCB(iterations, callback)
                })
            });
            break;
    }
}

/* MAIN TESTER */
async function main() {
    await redisCli.call("FLUSHALL", () => console.log("FLUSHED DB.\n"));
    process.stdout.write("WARM UP ZADD")
    zadd(SAMPLE_TIME, WARMUP_ITERATIONS, () => {
        process.stdout.write("WARM UP ZRANGE");
        zrange(0, WARMUP_ITERATIONS, () => {
            process.stdout.write("TESTING ZADD");
            zadd(SAMPLE_TIME + WARMUP_ITERATIONS, BENCHMARK_ITERATIONS, () => {
                process.stdout.write("TESTING ZRANGE");
                zrange(WARMUP_ITERATIONS, BENCHMARK_ITERATIONS, process.exit)
            })
        })
    });
}

main();

