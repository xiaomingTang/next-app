#!/bin/bash

# ftp required: sudo yum install ftp
# ssh required: sudo yum install ssh
# sshpass required: sudo yum install sshpass
# $P1_xxx series env variables is required

# you MUST run ssh... locally first time, to activate the ssh terminal,
# or you will get an error: pseudo-terminal will not be allocated because stdin is not a terminal.

# ----------------------------------------------

pnpm i

pnpm run build

rm -rf ./out/

pnpm run export

chmod -R 755 ./out

cd out

zip_file_name=".prod-$(date +%Y-%m-%d-%H-%M-%S).zip"

echo zip $zip_file_name ing...
# -q: silent
zip -r -q $zip_file_name .


ftp -inv $P1_FTP_HOST <<EOF
user $P1_FTP_USER $P1_FTP_PASSWORD
mput $zip_file_name
bye
EOF

# lsof -t -i:$port | xargs kill -15 # to be verified: not work

# pass them on the command line of the remote shell, and retrieve them via $1, $2: https://stackoverflow.com/a/37104048
# upzip -o means replace files if exists and not ask
sshpass -p $P1_SSH_PASSWORD ssh -p $P1_SSH_PORT -t $P1_SSH_USER@$P1_SSH_HOST "bash -s $P1_REMOTE_PORT $zip_file_name $P1_REMOTE_NAME" <<'EOL'
  port=$1
  file_name=$2
  remote_name=$3

  cd /www/wwwroot/$remote_name

  unzip -o $file_name
  lsof -i:$port | grep LISTEN | awk '{print $2}' | xargs kill -15
  bash /www/server/nodejs/vhost/scripts/$remote_name.sh
  exit
EOL

git add .
git stash
git stash drop
