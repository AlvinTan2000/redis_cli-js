#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <hiredis/hiredis.h>
#include <hiredis/async.h>
#include <hiredis/libevent.h>
#include "benchmarker.h"

redisContext *redisSyncCtx;
redisAsyncContext *redisAsyncCtx;
redisReply *reply;

const char *hostname = "127.0.0.1";
const int port = 6379;

void syncZADD() {
    const char *ZADDKEY = strdup("zaddkey");

    start_clock();
    for (int i = SAMPLE_TIME; i < BENCHMARK_ITERATIONS + SAMPLE_TIME; i++) {
        reply = redisCommand(redisSyncCtx, "ZADD %s %d %d", ZADDKEY, i, i);
//        if (reply->type == REDIS_REPLY_ERROR) {
//            printf("%s\n", reply->str);
//        }
        freeReplyObject(reply);
    }
    stop_clock();
    print_result(BENCHMARK_ITERATIONS);
}

void syncTADD() {

    const char *RTSKEY = strdup("rtskey");

    /* Synchronous Writes in RedisTimeSeries */
    reply = redisCommand(redisSyncCtx, "TS.CREATE %s", RTSKEY);
    if (reply->type == REDIS_REPLY_ERROR) {
        printf("%s\n", reply->str);
    }

    start_clock();
    for (int j = SAMPLE_TIME; j < BENCHMARK_ITERATIONS + SAMPLE_TIME; j++) {
        reply = redisCommand(redisSyncCtx, "TS.ADD %s %d 100", RTSKEY, j);
//        if (reply->type == REDIS_REPLY_ERROR) {
//            printf("%s\n", reply->str);
//        }
        freeReplyObject(reply);
    }
    stop_clock();
    print_result(BENCHMARK_ITERATIONS);
}


void getCallback(redisAsyncContext *c, void *r, void *privdata) {
    redisReply *reply = r;
    if (reply == NULL) {
        if (c->errstr) {
            printf("errstr: %s\n", c->errstr);
        }
        return;
    }
    printf("argv[%s]: %s\n", (char *) privdata, reply->str);

    /* Disconnect after receiving the reply to GET */
    redisAsyncDisconnect(c);
}

void connectCallback(const redisAsyncContext *c, int status) {
    if (status != REDIS_OK) {
        printf("Error: %s\n", c->errstr);
        return;
    }
    printf("Connected...\n");
}

void disconnectCallback(const redisAsyncContext *c, int status) {
    if (status != REDIS_OK) {
        printf("Error: %s\n", c->errstr);
        return;
    }
    printf("Disconnected...\n");
}

void syncConnect() {
    /* Connect to Redis server with synchronous API */
    redisSyncCtx = redisConnect(hostname, port);
    if (redisSyncCtx == NULL || redisSyncCtx->err) {
        if (redisSyncCtx) {
            printf("Connection error: %s\n", redisSyncCtx->errstr);
            redisFree(redisSyncCtx);
        } else {
            printf("Connection error: can't allocate redis context\n");
        }
        exit(1);
    }
}

void asyncConnect() {
    redisOptions options = {0};
    REDIS_OPTIONS_SET_TCP(&options, hostname, port);

    redisAsyncCtx = redisAsyncConnect(hostname, port);
    if (redisAsyncCtx == NULL || redisAsyncCtx->err) {
        if (redisAsyncCtx) {
            printf("Connection error: %s\n", redisAsyncCtx->errstr);
        } else {
            printf("Connection error: can't allocate redis context\n");
        }
        exit(1);
    }

    redisAsyncSetConnectCallback(redisAsyncCtx, connectCallback);
    redisAsyncSetDisconnectCallback(redisAsyncCtx, disconnectCallback);

}

int main(int argc, char **argv) {

    struct event_base *base = event_base_new();

    syncConnect();
    asyncConnect();

    redisLibeventAttach(redisAsyncCtx, base);

    redisAsyncCommand(redisAsyncCtx, NULL, NULL, "SET key %b", argv[argc - 1], strlen(argv[argc - 1]));
    redisAsyncCommand(redisAsyncCtx, getCallback, (char *) "end-1", "GET key");
    event_base_dispatch(base);

    syncZADD();

    restart_clock();

    syncTADD();


    /* Disconnects and frees the context */
    redisFree(redisSyncCtx);

    return 0;
}