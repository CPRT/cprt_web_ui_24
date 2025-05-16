#!/bin/bash
SCRIPT_DIR="$(dirname "$(realpath "$0")")"
CURRENT_DIR="$(pwd)"

sudo apt update && sudo apt upgrade
sudo apt install curl

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
\. "$HOME/.nvm/nvm.sh"
nvm install 20
nvm use 20

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

if [ "$SCRIPT_DIR" != "$CURRENT_DIR" ]; then
    echo "Moving to '$SCRIPT_DIR' to execute"
    cd $SCRIPT_DIR
fi
# export NODE_ENV=development
if [ ! -e "../node_modules" ]; then
    echo "nodes modules not installed, installing now"
    npm i --legacy-peer-deps
fi
echo "node modules installed, starting web ui server"
npm run dev

