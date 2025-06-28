#!/bin/bash

# ssh required: sudo yum install ssh
# sshpass required: sudo yum install sshpass
# $P1_xxx series env variables is required

# you MUST run ssh... locally first time, to activate the ssh terminal,
# or you will get an notFound error.

# ----------------------------------------------

# https://stackoverflow.com/a/2871034
set -euxo pipefail

now=$(date +%Y-%m-%d-%H-%M-%S)

zip_file_name=".bak.code-$now.tar.gz"

# 从 docker 取出代码并上传到服务器
docker_temp_container_name="temp-$now"
docker cp $(docker create --name $docker_temp_container_name $DOCKER_IMAGE_NAME):/app.tar.gz $zip_file_name
docker rm $docker_temp_container_name
SSHPASS=$P1_SSH_PASSWORD sshpass -e scp -r $zip_file_name $P1_SSH_USER@$P1_SSH_HOST:$(dirname $P1_REMOTE_DIR_WITHOUT_TAIL_SLASH)
rm -rf $zip_file_name

# lsof -t -i:$port | xargs kill -15
# lsof -i:$port | grep LISTEN | awk '{print $2}' | xargs kill -15

# pass them on the command line of the remote shell, and retrieve them via $1, $2: https://stackoverflow.com/a/37104048
# upzip -o means replace files if exists and not ask
SSHPASS=$P1_SSH_PASSWORD sshpass -e ssh -t $P1_SSH_USER@$P1_SSH_HOST "zsh -s $P1_REMOTE_PORT $zip_file_name $P1_REMOTE_DIR_WITHOUT_TAIL_SLASH $P1_APP_NAME $now" <<'EOL'
  port=$1
  file_name=$2
  remote_dir=$3
  app_name=$4
  now=$5

  source ~/.zshrc

  mv "$remote_dir" "$remote_dir.bak.$now"
  mkdir -p "$remote_dir"

  cd $(dirname "$remote_dir")
  tar -xzf $file_name -C "$remote_dir"

  if [ -d "$remote_dir.bak.$now/tmp" ]; then
    rsync -a "$remote_dir.bak.$now/tmp/" "$remote_dir/tmp/"
  else
    echo "跳过：$remote_dir.bak.$now/tmp 不存在"
  fi

  cd "$remote_dir"
  pm2 delete $app_name || true
  log_file_name=".bak/.bak.log-$now.log"
  pm2 start launch.sh --name $app_name --log $log_file_name
EOL
