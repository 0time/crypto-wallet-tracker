#!/usr/bin/env bash

set -ex

DIR=$HOME/c

docker rm -f crypto || echo 'do not care, failed to remove'

docker run \
  -d \
  --name crypto \
  -v $DIR:/app \
  -p 28080:28080 \
  --restart always \
  -w /app \
  keymux/docker-ubuntu-nvm-yarn \
  yarn start
