#!/bin/bash
CURRENT_USER=$(whoami)
SCRIPT_DIR="$(dirname "$(realpath "$0")")"

sudo cp webui_service.service /etc/systemd/system/webui_service.service
sudo sed -i "s|User=%i|User=${CURRENT_USER}|" /etc/systemd/system/webui_service.service
sudo sed -i "s|ExecStart=%i|ExecStart=bash ${SCRIPT_DIR}/start_webui.sh|" /etc/systemd/system/webui_service.service
sudo chmod 644 /etc/systemd/system/webui_service.service
# sudo ln -s $PWD/start_webui.sh /usr/local/bin/start_webui.sh

sudo chmod +x /${SCRIPT_DIR}/start_webui.sh

sudo systemctl daemon-reload
sudo systemctl enable webui_service.service
sudo systemctl start webui_service.service
