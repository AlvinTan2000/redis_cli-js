#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <hiredis/hiredis.h>
#include "benchmarker.h"

int main(int argc, char **argv) {
    redisContext *c;
    redisReply *reply;

    const char *hostname = (argc > 1) ? argv[1] : "127.0.0.1";
    const int port = (argc > 2) ? atoi(argv[2]) : 6379;

    /* Keys for Sorted Sets and RedisTimeSeries */
    const char *ZADDKEY = strdup("zaddkey");
    const char *RTSKEY = strdup("rtskey");

    /* Connect to Redis server  */
    c = redisConnect(hostname, port);
    if (c == NULL || c->err) {
        if (c) {
            printf("Connection error: %s\n", c->errstr);
            redisFree(c);
        } else {
            printf("Connection error: can't allocate redis context\n");
        }
        exit(1);
    }


    /* Synchronous Writes in Sorted Sets */
    start_clock();
    for (int i = SAMPLE_TIME; i < BENCHMARK_ITERATIONS+SAMPLE_TIME; i++) {
        reply = redisCommand(c, "ZADD %s %d %d", ZADDKEY, i,i);
//        if (reply->type == REDIS_REPLY_ERROR) {
//            printf("%s\n", reply->str);
//        }
        freeReplyObject(reply);
    }
    stop_clock();
    print_result(BENCHMARK_ITERATIONS);

    restart_clock();

    /* Synchronous Writes in RedisTimeSeries */
    reply = redisCommand(c, "TS.CREATE %s", RTSKEY);
    if (reply->type == REDIS_REPLY_ERROR) {
        printf("%s\n", reply->str);
    }


    start_clock();
    for (int j = SAMPLE_TIME; j < BENCHMARK_ITERATIONS+SAMPLE_TIME; j++) {
        reply = redisCommand(c, "TS.ADD %s %d 100", RTSKEY, j);
//        if (reply->type == REDIS_REPLY_ERROR) {
//            printf("%s\n", reply->str);
//        }
        freeReplyObject(reply);
    }
    stop_clock();
    print_result(BENCHMARK_ITERATIONS);


/* Disconnects and frees the context */
    redisFree(c);

    return 0;
}