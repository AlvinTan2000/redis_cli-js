const Benchmarker = require('./redis_benchmarker');

/* Counter for determining last callback */
let counter = 0;

/* CALLBACKS */
async function redisCB(iterations, cb) {
    counter++;

    /* End timer upon last callback and call next function */
    if (counter >= iterations) {
        Benchmarker.stopClock();
        Benchmarker.printResult(iterations);
        counter = 0;
        cb();
    }
}

module.exports = {
    redisCB: redisCB,
}