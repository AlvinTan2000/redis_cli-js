#ifndef REDIS_TEST_BENCHMARKER_H
#define REDIS_TEST_BENCHMARKER_H

#endif //REDIS_TEST_BENCHMARKER_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <time.h>

#define Benchmark_timespec_init (struct timespec*)malloc(sizeof(struct timespec))

#ifdef DEBUG
static const unsigned long long BENCHMARK_ITERATIONS = 1e3;
#else
static const unsigned long long BENCHMARK_ITERATIONS = 1e5;
#endif
static const unsigned long long SAMPLE_TIME = 1577836800;
static const unsigned long long NSEC_PER_SEC = 1e9;
static const unsigned long long BILLION = 1e9;

struct timespec begin, end, result, sum;

void timespec_subtract (struct timespec*, struct timespec*, struct timespec*);
void timespec_add (struct timespec*, struct timespec*, struct timespec*);

void start_clock (void);
void stop_clock (void);
void restart_clock(void);

void print_result (unsigned long long);