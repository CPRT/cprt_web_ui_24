#!/bin/bash
CURRENT_USER=$(whoami)
SCRIPT_DIR="$(dirname "$(realpath "$0")")"

sudo cp start_webui.service /etc/systemd/system/start_webui.service
sudo sed -i "s|User=%i|User=${CURRENT_USER}|" /etc/systemd/system/start_webui.service
sudo sed -i "s|ExecStart=%i|ExecStart=${SCRIPT_DIR}/start_webui.sh|" /etc/systemd/system/start_webui.service
sudo chmod 644 /etc/systemd/system/start_webui.service
# sudo ln -s $PWD/start_webui.sh /usr/local/bin/start_webui.sh

sudo chmod +x /${SCRIPT_DIR}/start_webui.sh

sudo systemctl daemon-reload
sudo systemctl enable start_webui.service
sudo systemctl start start_webui.service
