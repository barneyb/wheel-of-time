#!/usr/bin/env bash
set -e

pushd client
npm run build
popd
firebase deploy --only hosting
