#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <hiredis/hiredis.h>

int main(int argc, char **argv) {
    redisContext *c;
    redisReply *reply;

    const char *hostname = (argc > 1) ? argv[1] : "127.0.0.1";
    int port = (argc > 2) ? atoi(argv[2]) : 6379;

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

    /* Let's check what we have inside the list */
    char *ZADDKEY = strdup("zaddkey");
    for (int i = 0; i < 1000; i++) {
        reply = redisCommand(c, "ZADD %s %d %d", ZADDKEY, i,i);
        if (reply->type == REDIS_REPLY_ERROR) {
            printf("%s\n", reply->str);
        }
        freeReplyObject(reply);
    }

/* Disconnects and frees the context */
    redisFree(c);

    return 0;
}