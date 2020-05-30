#include "benchmarker.h"

void start_clock (void) {
    clock_gettime(CLOCK_PROCESS_CPUTIME_ID, &begin);
}

void stop_clock (void) {
    clock_gettime(CLOCK_PROCESS_CPUTIME_ID, &end);
    timespec_subtract(&result, &begin, &end);
    timespec_add(&sum, &sum, &result);
}

void restart_clock(void){
    sum.tv_sec = 0;
    sum.tv_nsec = 0;
}

void timespec_subtract (struct timespec *result, struct timespec *begin, struct timespec *end) {
    if (end->tv_nsec < begin->tv_nsec) {
        result->tv_sec = end->tv_sec - begin->tv_sec - 1;
        result->tv_nsec = end->tv_nsec - begin->tv_nsec + 1e9;
    } else {
        result->tv_sec = end->tv_sec - begin->tv_sec;
        result->tv_nsec = end->tv_nsec - begin->tv_nsec;
    }
}

void timespec_add (struct timespec *result, struct timespec *first, struct timespec *second) {
    result->tv_sec = first->tv_sec + second->tv_sec;
    result->tv_nsec = first->tv_nsec + second->tv_nsec;
    if (result->tv_nsec >= BILLION) {
        result->tv_nsec -= BILLION;
        result->tv_sec++;
    }
}

void print_result (unsigned long long iterations) {
    iterations = iterations ? iterations : BENCHMARK_ITERATIONS;

    unsigned long long total_nano_seconds = sum.tv_sec * NSEC_PER_SEC + sum.tv_nsec;
    unsigned long long average = total_nano_seconds / iterations;

    result.tv_sec = average / NSEC_PER_SEC;
    result.tv_nsec = average % NSEC_PER_SEC;

    printf("\033[1;31m");
    printf("Total time elapsed: %lu.%09lu seconds for %llu iterations \n", sum.tv_sec, sum.tv_nsec, iterations);
    printf("\033[0m");
}
