/* Redis modules and custom benchmarking module */
const IORedis = require('ioredis');
const {Command} = require('ioredis');
const cb = require('../redis_callbacks');
const benchmarker = require('../redis_benchmarker')
const {SSKEY} = require("../redis_benchmarker");
const {SAMPLE_TIME} = require("../redis_benchmarker");
const {WARMUP_ITERATIONS} = require("../redis_benchmarker");
const {BENCHMARK_ITERATIONS} = require("../redis_benchmarker");

const option = 2;

/* Initialize redis client */
const redisCli = new IORedis(benchmarker.REDIS_OPT);

/* WARM UP ITERATIONS */
function coldZADD() {
    process.stdout.write("WARMING UP ZADD");
    switch (option) {
        case 0:
            benchmarker.startClock()
            for (let i = SAMPLE_TIME; i < SAMPLE_TIME + WARMUP_ITERATIONS; i++) {
                redisCli.zadd([SSKEY, i, i], () => cb.redisCB(WARMUP_ITERATIONS, coldZRANGE));
            }
            break;

        case 1:
            benchmarker.startClock()
            for (let i = SAMPLE_TIME; i < SAMPLE_TIME + WARMUP_ITERATIONS; i++) {
                redisCli.sendCommand(new Command("ZADD", [SSKEY, i, i], 'utf-8', () => cb.redisCB(BENCHMARK_ITERATIONS, coldZRANGE)));
            }
            break;

        case 2:
            benchmarker.startClock()
            for (let i = SAMPLE_TIME; i < SAMPLE_TIME + WARMUP_ITERATIONS; i++) {
                redisCli.call("ZADD", [SSKEY, i, i], () => cb.redisCB(BENCHMARK_ITERATIONS, coldZRANGE));
            }
            break;
        default:
            console.log("Invalid Option");
    }

}

function coldZRANGE() {
    process.stdout.write("WARMING UP ZRANGE");
    benchmarker.startClock()
    switch (option) {
        case 0:
            benchmarker.startClock()
            for (let i = 0; i < WARMUP_ITERATIONS; i++) {
                redisCli.zrange([SSKEY, i, i + 1], () => cb.redisCB(WARMUP_ITERATIONS, warmZADD));
            }
            break;

        case 1:
            benchmarker.startClock()
            for (let i = 0; i < WARMUP_ITERATIONS; i++) {
                redisCli.sendCommand(new Command("ZRANGE", [SSKEY, i, i + 1, 'WITHSCORES'], 'utf-8', () => cb.redisCB(WARMUP_ITERATIONS, warmZADDAlt)));
            }
            break;

        case 2:
            benchmarker.startClock()
            for (let i = 0; i < WARMUP_ITERATIONS; i++) {
                redisCli.call("ZRANGE", [SSKEY, i, i + 1, 'WITHSCORES'], ()=> cb.redisCB(WARMUP_ITERATIONS, warmZADDAlt2));
            }
            break;
    }

}

/* CLIENT ITERATIONS */
function warmZADD() {
    process.stdout.write("TESTING ZADD");
    benchmarker.startClock()
    for (let i = SAMPLE_TIME + WARMUP_ITERATIONS; i < SAMPLE_TIME + WARMUP_ITERATIONS + BENCHMARK_ITERATIONS; i++) {
        redisCli.zadd([SSKEY, i, i], () => cb.redisCB(BENCHMARK_ITERATIONS, warmZRANGE));
    }
}

function warmZRANGE() {
    process.stdout.write("TESTING ZRANGE");
    benchmarker.startClock()
    for (let i = WARMUP_ITERATIONS; i < WARMUP_ITERATIONS + BENCHMARK_ITERATIONS; i++) {
        redisCli.zrange([SSKEY, i, i + 1], () => cb.redisCB(BENCHMARK_ITERATIONS, process.exit));
    }
}

/* Alternative method using .sendCommand() */
function warmZADDAlt() {
    process.stdout.write("TESTING ZADD");
    benchmarker.startClock()
    for (let i = SAMPLE_TIME + WARMUP_ITERATIONS; i < SAMPLE_TIME + WARMUP_ITERATIONS + BENCHMARK_ITERATIONS; i++) {
        redisCli.sendCommand(new Command("ZADD", [SSKEY, i, i], 'utf-8', () => cb.redisCB(BENCHMARK_ITERATIONS, warmZRANGEAlt)));
    }
}

function warmZRANGEAlt() {
    process.stdout.write("TESTING ZRANGE");
    benchmarker.startClock()
    for (let i = WARMUP_ITERATIONS; i < WARMUP_ITERATIONS + BENCHMARK_ITERATIONS; i++) {
        redisCli.sendCommand(new Command("ZRANGE", [SSKEY, i, i + 1, 'WITHSCORES'], 'utf-8', () => cb.redisCB(BENCHMARK_ITERATIONS, process.exit)));
    }
}

/* Alternative method using .call() */
function warmZADDAlt2() {
    process.stdout.write("TESTING ZADD");
    benchmarker.startClock()
    for (let i = SAMPLE_TIME + WARMUP_ITERATIONS; i < SAMPLE_TIME + WARMUP_ITERATIONS + BENCHMARK_ITERATIONS; i++) {
        redisCli.call("ZADD", [SSKEY, i, i], () => cb.redisCB(BENCHMARK_ITERATIONS, warmZRANGEAlt2));
    }
}

function warmZRANGEAlt2() {
    process.stdout.write("TESTING ZRANGE");
    benchmarker.startClock()
    for (let i = WARMUP_ITERATIONS; i < WARMUP_ITERATIONS + BENCHMARK_ITERATIONS; i++) {
        redisCli.call("ZRANGE", [SSKEY, i, i + 1, 'WITHSCORES'], () => cb.redisCB(BENCHMARK_ITERATIONS, process.exit));
    }
}

/* MAIN TESTER */
async function main() {
    await redisCli.call("FLUSHALL", () => console.log("FLUSHED DB.\n"));
    coldZADD();
}

main();

