const benchmarker = require('./redis_benchmarker');

/* Read and write counter for determining last callback */
let counter = 0;

/* CALLBACKS */
async function redisCB(iterations, cb) {
    counter++;
    /* End timer upon last callback and call next function */
    if (counter >= iterations) {
        benchmarker.stopClock();
        benchmarker.printResult(counter);
        counter=0;
        cb();
    }
}

module.exports = {
    redisCB : redisCB,
}