const BENCHMARK_ITERATIONS = parseInt(1e5);
const NSEC_PER_SEC = parseInt(1e9);
const SAMPLE_TIME = Date.now();
const ZADDKEY = 'zaddkey';
const RTSKEY = "rtskey";
const REDIS_OPT = {
    host: 'localhost',
    port: 6379
}

let start, stop;
let result = [0, 0];

function startClock() {
    // console.log("Start clock");
    start = process.hrtime();
}

function stopClock() {
    // console.log("Stop clock");
    stop = process.hrtime(start);
}

function printResult(iterations) {
    iterations = iterations ? iterations : BENCHMARK_ITERATIONS;

    let totalNanoSeconds = stop[0] * NSEC_PER_SEC + stop[1];
    let average = parseInt(totalNanoSeconds / iterations);
    result[0] = parseInt(average / NSEC_PER_SEC);
    result[1] = average % NSEC_PER_SEC;

    console.log("\033[1;31m");
    console.log("Total time elapsed: %d.%s seconds for %d iterations",
        stop[0], stop[1].toString().padStart(9, '0'), iterations
    );
}

module.exports = {
    startClock: startClock,
    stopClock: stopClock,
    printResult: printResult,
    BENCHMARK_ITERATIONS: BENCHMARK_ITERATIONS,
    REDIS_OPT: REDIS_OPT,
    SAMPLE_TIME: SAMPLE_TIME,
    ZADDKEY: ZADDKEY,
    RTSKEY: RTSKEY
}