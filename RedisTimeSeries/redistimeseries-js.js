const redisTS = require('redistimeseries-js');
const benchmarker = require('../redis_benchmarker')

const redisOpt = {
    host: 'localhost',
    port: 7000
}
const redisTSClient = new redisTS(redisOpt);

const SAMPLE_TIME = 1577836800;
let replyCounter = 0;

/** TESTING REDIS TIME SERIES **/
const rtsKey = "rtsKey";


async function asynchronousTSADD() {
    await redisTSClient.connect();
    await redisTSClient.create(rtsKey).send();
    benchmarker.startClock();
    for (let i = 0; i < benchmarker.BENCHMARK_ITERATIONS; i++) {
        redisTSClient.madd([{key: rtsKey, timestamp: i+SAMPLE_TIME, value: 100}]).send().then(
            // Callback to increase reply counter, which stops the timer and print results if last reply
            (error, result) => {
                replyCounter++;
                if (replyCounter >= benchmarker.BENCHMARK_ITERATIONS) {
                    benchmarker.stopClock();
                    benchmarker.printResult(replyCounter);
                    replyCounter =0;
                    asynchronousTSRANGE();
                }
            })
            .catch(console.log)
    }
}


function asynchronousTSRANGE() {
    benchmarker.startClock();
    for (let i = 0; i < benchmarker.BENCHMARK_ITERATIONS; i++) {
        redisTSClient.range(rtsKey, i+SAMPLE_TIME, i+SAMPLE_TIME+1).send().then(
            // Callback to increase reply counter, which stops the timer and print results if last reply
            (result) => {
                replyCounter++;
                if (replyCounter >= benchmarker.BENCHMARK_ITERATIONS) {
                    benchmarker.stopClock();
                    benchmarker.printResult(replyCounter);
                }
            })
            .catch(console.log)
    }
}

function main() {
    asynchronousTSADD();
}

main();