CMAKE_MINIMUM_REQUIRED(VERSION 3.16)
SET(CMAKE_C_STANDARD 99)
PROJECT(redis_test)

# Change this location for where hiredis is located
SET(HIREDIS_DIR /opt/hiredis)
LINK_DIRECTORIES("${HIREDIS_DIR}")

# Source Files to compile
SET(
        SOURCE_FILES
        main.c
        benchmarker.c benchmarker.h
)

ADD_EXECUTABLE("${PROJECT_NAME}" "${SOURCE_FILES}")
TARGET_LINK_LIBRARIES("${PROJECT_NAME}" PRIVATE libhiredis.so)
TARGET_LINK_LIBRARIES("${PROJECT_NAME}" PRIVATE libevent.so)

