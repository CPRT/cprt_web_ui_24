#!/bin/bash

if [ ! -e "node_modules" ]; then
    echo "nodes modules not installed, installing now"
    npm i --legacy-peer-deps
fi

echo "node modules installed, starting web ui server"
npm run dev