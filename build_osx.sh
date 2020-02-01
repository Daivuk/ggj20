#!/bin/bash

# Exit on first error
set -e 

# Clone onut
git submodule update --init --recursive

# Create build dir
mkdir -p build

# cd to build dir
cd build

# We want to use hunter and we want to build the stand alone (onut.exe)
cmake -DONUT_USE_HUNTER=OFF -DONUT_BUILD_STANDALONE=ON -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF ../onut/

# Compile
make -j8

# Copy executable
cp ./JSStandAlone/onut ../game/ExecutableOSX
