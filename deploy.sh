#!/bin/bash

# ssh required: sudo yum install ssh
# sshpass required: sudo yum install sshpass
# pm2 required: pnpm i -g pm2
# $P1_xxx series env variables is required

# you MUST run ssh... locally first time, to activate the ssh terminal,
# or you will get an error: pseudo-terminal will not be allocated because stdin is not a terminal.

# ----------------------------------------------

# https://stackoverflow.com/a/2871034
set -euxo pipefail

if [[ -v IGNORE_BUILD ]] && [ -d "out" ]; then
  echo "skip build"
else
  pnpm i

  pnpm run build

  rm -rf ./out/

  pnpm run export

  chmod -R 755 ./out
fi

cd out

rm .bak.code-*.zip

zip_file_name=".bak.code-$(date +%Y-%m-%d-%H-%M-%S).zip"

echo zip $zip_file_name ing...
# -q: silent
zip -r -q $zip_file_name .
echo zip $zip_file_name finished

echo upload $zip_file_name ing...
sshpass -p $P1_SSH_PASSWORD scp -r $zip_file_name $P1_SSH_USER@$P1_SSH_HOST:$P1_REMOTE_DIR_WITHOUT_TAIL_SLASH
echo upload $zip_file_name finished

# lsof -t -i:$port | xargs kill -15
# lsof -i:$port | grep LISTEN | awk '{print $2}' | xargs kill -15

# pass them on the command line of the remote shell, and retrieve them via $1, $2: https://stackoverflow.com/a/37104048
# upzip -o means replace files if exists and not ask
sshpass -p $P1_SSH_PASSWORD ssh -t $P1_SSH_USER@$P1_SSH_HOST "bash -s $P1_REMOTE_PORT $zip_file_name $P1_REMOTE_DIR_WITHOUT_TAIL_SLASH $P1_APP_NAME" <<'EOL'
  port=$1
  file_name=$2
  remote_dir=$3
  app_name=$4

  pm2 stop $app_name

  cd $remote_dir
  unzip -q -o $file_name

  log_file_name=".bak.log-$(date +%Y-%m-%d-%H-%M-%S).log"
  pm2 start node --name $app_name --log $log_file_name -- server.js
  # 限制 log 备份文件数量
  ls -at .bak.log-*.log | sed -n '100,$p' | xargs -I {} rm -rf {}
  # 限制 code 备份文件数量
  ls -at .bak.code-*.zip | sed -n '10,$p' | xargs -I {} rm -rf {}
EOL

cd ..

git add .
git stash
git stash drop
