#!/bin/bash
SCRIPT_DIR="$(dirname "$(realpath "$0")")"
CURRENT_DIR="$(pwd)"

if [ "$SCRIPT_DIR" != "$CURRENT_DIR" ]; then
    echo "Please run this script from '$SCRIPT_DIR'"
    exit 1
fi
if [ ! -e "../node_modules" ]; then
    echo "nodes modules not installed, installing now"
    npm i --legacy-peer-deps
fi
echo "node modules installed, starting web ui server"
npm run open

