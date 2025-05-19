#!/bin/bash

if docker ps -a --format '{{.Names}}' | grep -wq "tiling-server-container"; then
  echo "Tiling container exists, removing..."
  docker stop tiling-server-container
fi

docker run --rm --name tiling-server-container -d --network=host tiling-server

npm run build

npm run start