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
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

if [ "$SCRIPT_DIR" != "$CURRENT_DIR" ]; then
    echo "Moving to '$SCRIPT_DIR' to execute"
    cd $SCRIPT_DIR
fi

if [ ! -e "../node_modules" ]; then
    echo "nodes modules not installed, installing now"
    npm i --legacy-peer-deps
fi

CURRENT_USER=$(whoami)
SCRIPT_DIR="$(dirname "$(realpath "$0")")"

sudo cp webui_service.service /etc/systemd/system/webui_service.service
sudo sed -i "s|User=%i|User=${CURRENT_USER}|" /etc/systemd/system/webui_service.service
sudo sed -i "s|ExecStart=%i|ExecStart=bash ${SCRIPT_DIR}/../start.sh|" /etc/systemd/system/webui_service.service
sudo chmod 644 /etc/systemd/system/webui_service.service

sudo chmod +x /${SCRIPT_DIR}/start_webui.sh

sudo systemctl daemon-reload
sudo systemctl enable webui_service.service
sudo systemctl start webui_service.service
