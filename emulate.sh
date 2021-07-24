#!/usr/bin/env bash

firebase emulators:start \
    --only auth,firestore \
    --import=./firebase_emulator_data/ \
    --export-on-exit
