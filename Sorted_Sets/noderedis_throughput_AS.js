/* Redis modules, custom callback and benchmarking module */
const Redis = require('redis');
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
*/
const option = 0;

const redisCli = Redis.createClient(Benchmarker.REDIS_OPT);

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
                redisCli.send_command("ZADD", [SSKEY, i, i], () => {
                    CB.redisCB(iterations, callback)
                });
            })
            break;
    }
}

function zrange(offset, iterations, callback) {
    switch (option) {
        case 0:
            redisCommand(offset, iterations, (i) => {
                redisCli.zrange([SSKEY, i, i+1], () => {
                    CB.redisCB(iterations, callback)
                })
            });
            break;

        case 1:
            redisCommand(offset, iterations, (i) => {
                redisCli.send_command("ZRANGE", [SSKEY, i, i + 1], () => {
                    CB.redisCB(iterations, callback)
                });
            })
            break;
    }
}

/* MAIN TESTER */
async function main() {
    console.log("FLUSHED")
    redisCli.flushall(() => {
        process.stdout.write("WARM UP ZADD");
        zadd(SAMPLE_TIME, WARMUP_ITERATIONS, () => {
            process.stdout.write("WARM UP ZRANGE");
            zrange(0, WARMUP_ITERATIONS, () => {
                process.stdout.write("TESTING ZADD");
                zadd(SAMPLE_TIME + WARMUP_ITERATIONS, BENCHMARK_ITERATIONS, () => {
                    process.stdout.write("TESTING ZRANGE");
                    zrange(WARMUP_ITERATIONS, BENCHMARK_ITERATIONS, process.exit)
                })
            })
        })
    });
}

main();

