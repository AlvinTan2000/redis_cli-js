#include "sortedSets.h"

static int counter = 0;


void warmZRANGECB(redisAsyncContext *c, void *r, void *privdata) {
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


void warmZRANGE() {
    start_clock();
    for (int j = WARMUP_ITERATIONS; j < WARMUP_ITERATIONS+BENCHMARK_ITERATIONS; j++) {
        redisAsyncCommand(redisAsyncCtx, warmZRANGECB, NULL, "ZRANGE %s %d %d", ZADDKEY, j, j);
    }
}


void warmZADDCB(redisAsyncContext *c, void *r, void *privdata) {
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
        warmZRANGE();
    }
}


void warmZADD() {
    start_clock();
    for (int j = SAMPLE_TIME+WARMUP_ITERATIONS; j <SAMPLE_TIME+WARMUP_ITERATIONS+BENCHMARK_ITERATIONS; j++) {
        redisAsyncCommand(redisAsyncCtx, warmZADDCB, NULL, "ZADD %s %d %d", ZADDKEY, j, j);
    }
}

void coldZRANGECB(redisAsyncContext *c, void *r, void *privdata) {
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
        warmZADD();
    }
}


void coldZRANGE(){
    start_clock();
    for (int j = 0; j < WARMUP_ITERATIONS; j++) {
        redisAsyncCommand(redisAsyncCtx, coldZRANGECB, NULL, "ZRANGE %s %d %d", ZADDKEY, j, j + 1);
    }
}

void coldZADDCB(redisAsyncContext *c, void *r, void *privdata) {
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
        coldZRANGE();
    }
}

void coldZADD() {
    start_clock();
    for (int j = SAMPLE_TIME; j <SAMPLE_TIME+WARMUP_ITERATIONS; j++) {
        redisAsyncCommand(redisAsyncCtx, coldZADDCB, NULL, "ZADD %s %d %d", ZADDKEY, j, j);
    }
}




