cmake_minimum_required(VERSION 3.16)
set(CMAKE_C_STANDARD 99)
project(redis_test)

# Change this location for where hiredis is located
set(HIREDIS_DIR /opt/hiredis)
LINK_DIRECTORIES("${HIREDIS_DIR}")

# Source Files to compile
set(
        SOURCE_FILES
        main.c
        benchmarker.c benchmarker.h)

add_executable("${PROJECT_NAME}" "${SOURCE_FILES}")
target_link_libraries("${PROJECT_NAME}" PRIVATE libhiredis.so)