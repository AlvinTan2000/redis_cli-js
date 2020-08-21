#ifndef REDIS_TEST_BENCHMARKER_H
#define REDIS_TEST_BENCHMARKER_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <time.h>
#include <hiredis/hiredis.h>
#include <hiredis/async.h>
#include <hiredis/libevent.h>

#ifdef DEBUG
static const unsigned long long BENCHMARK_ITERATIONS = 1e3;
#else
static const unsigned long long BENCHMARK_ITERATIONS = 1e6;
static const unsigned long long WARMUP_ITERATIONS = 1e6;
#endif
static const char ZADDKEY[] = "zaddkey";
static const char RTSKEY[] = "rtskey";
static const unsigned long long SAMPLE_TIME = 1577836800;
static const unsigned long long NSEC_PER_SEC = 1e9;
static const unsigned long long BILLION = 1e9;

extern redisContext *redisSyncCtx;
extern redisAsyncContext *redisAsyncCtx;
extern redisReply *reply;

struct timespec begin, end, result, sum;

void timespec_subtract (struct timespec*, struct timespec*, struct timespec*);
void timespec_add (struct timespec*, struct timespec*, struct timespec*);

void start_clock (void);
void stop_clock (void);
void restart_clock(void);

void print_result (unsigned long long);

#endif //REDIS_TEST_BENCHMARKER_H