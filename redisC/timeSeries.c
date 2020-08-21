#include "timeSeries.h"

static int counter = 0;

void warmTSRANGECB(redisAsyncContext *c, void *r, void *privdata) {
    redisReply *reply = r;
    if (reply == NULL) {
        if (c->errstr) {
            printf("errstr: %s\n", c->errstr);
        }
        return;
    }
    counter++;
//    printf("argv[%s]: %s\n", (char *) privdata, reply->str);
    if (counter == BENCHMARK_ITERATIONS) {
        stop_clock();
        print_result(BENCHMARK_ITERATIONS);
        redisAsyncDisconnect(redisAsyncCtx);
    }
}


void warmTSRANGE() {
    start_clock();
    for (int j = SAMPLE_TIME+WARMUP_ITERATIONS; j <SAMPLE_TIME+WARMUP_ITERATIONS+BENCHMARK_ITERATIONS; j++) {
        redisAsyncCommand(redisAsyncCtx, warmTSRANGECB, NULL, "TS.RANGE %s %d %d", RTSKEY, j, j + 1);
    }
}


void warmTSADDCB(redisAsyncContext *c, void *r, void *privdata) {
    redisReply *reply = r;
    if (reply == NULL) {
        if (c->errstr) {
            printf("errstr: %s\n", c->errstr);
        }
        return;
    }
    counter++;
//    printf("argv[%s]: %s\n", (char *) privdata, reply->str);
    if (counter == BENCHMARK_ITERATIONS) {
        stop_clock();
        print_result(BENCHMARK_ITERATIONS);
        redisAsyncDisconnect(redisAsyncCtx);
    }
}


void warmTSADD() {
    start_clock();
    for (int j = SAMPLE_TIME+WARMUP_ITERATIONS; j <SAMPLE_TIME+WARMUP_ITERATIONS+BENCHMARK_ITERATIONS; j++) {
        redisAsyncCommand(redisAsyncCtx, warmTSADDCB, NULL, "TS.ADD %s %d %d", RTSKEY, j,j);
    }
}

void coldTSRANGECB(redisAsyncContext *c, void *r, void *privdata) {
    redisReply *reply = r;
    if (reply == NULL) {
        if (c->errstr) {
            printf("errstr: %s\n", c->errstr);
        }
        return;
    }
    counter++;
//    printf("argv[%s]: %s\n", (char *) privdata, reply->element[0]->str);
    if (counter == BENCHMARK_ITERATIONS) {
        stop_clock();
        print_result(BENCHMARK_ITERATIONS);
        restart_clock();
        counter = 0;
        warmTSADD();
    }
}


void coldTSRANGE(){
    start_clock();
    for (int j = SAMPLE_TIME; j < WARMUP_ITERATIONS + SAMPLE_TIME; j++) {
        redisAsyncCommand(redisAsyncCtx, coldTSRANGECB, NULL, "TS.RANGE %s %d %d", RTSKEY, j, j + 1);
    }
}

void coldTSADDCB(redisAsyncContext *c, void *r, void *privdata) {
    redisReply *reply = r;
    if (reply == NULL) {
        if (c->errstr) {
            printf("errstr: %s\n", c->errstr);
        }
        return;
    }
    counter++;
//    printf("argv[%s]: %s\n", (char *) privdata, reply->str);
    if (counter == BENCHMARK_ITERATIONS) {
        stop_clock();
        print_result(BENCHMARK_ITERATIONS);
        restart_clock();
        counter = 0;
        warmTSADD();
    }
}

void coldTSADD() {
    reply = redisCommand(redisSyncCtx, "TS.CREATE %s", RTSKEY);
    if (reply->type == REDIS_REPLY_ERROR) {
        printf("%s\n", reply->str);
    }

    start_clock();
    for (int j = SAMPLE_TIME; j <SAMPLE_TIME+WARMUP_ITERATIONS; j++) {
        redisAsyncCommand(redisAsyncCtx, coldTSADDCB, NULL, "TS.ADD %s %d %d", RTSKEY, j,j);
    }
}
