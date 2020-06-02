const benchmarker = require('./redis_benchmarker');

/* Read and write counter for determining last callback */
let writeCounter = 0;
let readCounter = 0;

/* CALLBACKS */
function addCB(cb) {
    /* Start timer upon first callback */
    if (writeCounter === 0) {
        benchmarker.startClock();
    }
    writeCounter++;
    /* End timer upon last callback */
    if (writeCounter >= benchmarker.BENCHMARK_ITERATIONS) {
        benchmarker.stopClock();
        benchmarker.printResult(writeCounter);
        cb();
    }
}
function rangeCB() {
    /* Start timer upon first callback */
    if (readCounter === 0) {
        benchmarker.startClock();
    }
    readCounter++;
    /* End timer upon last callback */
    if (readCounter >= benchmarker.BENCHMARK_ITERATIONS) {
        benchmarker.stopClock();
        benchmarker.printResult(writeCounter);
    }
}

module.exports = {
    addCB : addCB,
    rangeCB : rangeCB
}