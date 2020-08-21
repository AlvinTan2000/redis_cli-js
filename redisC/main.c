#include "benchmarker.h"
#include "sortedSets.h"
#include "timeSeries.h"

redisContext *redisSyncCtx;
redisAsyncContext *redisAsyncCtx;
redisReply *reply;

const char *hostname = "127.0.0.1";
const int port = 6379;

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
    redisAsyncCtx = redisAsyncConnect(hostname, port);
    if (redisAsyncCtx == NULL || redisAsyncCtx->err) {
        if (redisAsyncCtx) {
            printf("Connection error: %s\n", redisAsyncCtx->errstr);
        } else {
            printf("Connection error: can't allocate redis context\n");
        }
        exit(1);
    }
    /* Set Connect and Disconnect Callback */
    redisAsyncSetConnectCallback(redisAsyncCtx, connectCallback);
    redisAsyncSetDisconnectCallback(redisAsyncCtx, disconnectCallback);
}


int main(int argc, char **argv) {
    /* Connect to Redis Synchronously / Asynchronously */
    syncConnect();
    asyncConnect();

    /* Create event Base and attach it to Redis using adapter */
    struct event_base *base = event_base_new();
    redisLibeventAttach(redisAsyncCtx, base);

    /* Flush database initially */
    reply = redisCommand(redisSyncCtx, "FLUSHALL");
    if (reply->type == REDIS_REPLY_ERROR) {
        printf("%s\n", reply->str);
    }
    freeReplyObject(reply);

/* Asynchronous ZADD and TSADD */
    coldZADD();
//    coldTSADD();

    /* Free/Disconnects synchronous/asynchronous context and dispatch event base */
    redisFree(redisSyncCtx);
    event_base_dispatch(base);

    return 0;
}