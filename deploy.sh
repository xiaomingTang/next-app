#!/bin/bash

# ssh required: sudo yum install ssh
# sshpass required: sudo yum install sshpass
# $P1_xxx series env variables is required

# you MUST run ssh... locally first time, to activate the ssh terminal,
# or you will get an notFound error.

# ----------------------------------------------

# https://stackoverflow.com/a/2871034
set -euxo pipefail

zip_file_name=".bak.code-$(date +%Y-%m-%d-%H-%M-%S).zip"

docker_temp_container_name="temp-$(date +%Y-%m-%d-%H-%M-%S)"

docker cp $(docker create --name $docker_temp_container_name $DOCKER_IMAGE_NAME):$ZIP_PATH $zip_file_name
docker rm $docker_temp_container_name

SSHPASS=$P1_SSH_PASSWORD sshpass -e scp -r $zip_file_name $P1_SSH_USER@$P1_SSH_HOST:$P1_REMOTE_DIR_WITHOUT_TAIL_SLASH

rm -rf $zip_file_name

# lsof -t -i:$port | xargs kill -15
# lsof -i:$port | grep LISTEN | awk '{print $2}' | xargs kill -15

# pass them on the command line of the remote shell, and retrieve them via $1, $2: https://stackoverflow.com/a/37104048
# upzip -o means replace files if exists and not ask
SSHPASS=$P1_SSH_PASSWORD sshpass -e ssh -t $P1_SSH_USER@$P1_SSH_HOST "zsh -s $P1_REMOTE_PORT $zip_file_name $P1_REMOTE_DIR_WITHOUT_TAIL_SLASH $P1_APP_NAME" <<'EOL'
  port=$1
  file_name=$2
  remote_dir=$3
  app_name=$4

  source ~/.zshrc

  cd $remote_dir
  unzip -q -o $file_name
  mv $file_name .bak/$file_name

  pm2 delete $app_name
  log_file_name=".bak/.bak.log-$(date +%Y-%m-%d-%H-%M-%S).log"
  pm2 start launch.sh --name $app_name --log $log_file_name
  # 限制 log 备份文件数量
  ls -at .bak/.bak.log-*.log | sed -n '30,$p' | xargs -I {} rm -rf {}
  # 限制 code 备份文件数量
  ls -at .bak/.bak.code-*.zip | sed -n '5,$p' | xargs -I {} rm -rf {}
EOL
