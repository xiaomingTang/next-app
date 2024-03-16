#!/usr/bin/zsh

# 备份文件名
ROOT=$(cd $(dirname $(dirname $0)); pwd)
DB_BACKUP_FILE="$ROOT/.bak/.bak.sql-$(date +%Y-%m-%d-%H-%M-%S).sql"
# 执行备份
mysqldump -u$DB_USER -p$DB_PASSWORD $DB_NAME > $DB_BACKUP_FILE --no-tablespaces

echo "backup finished: $DB_BACKUP_FILE"

# crontab -e 并添加一个任务, 如: 0 3 * * * /path/to/backup_script.sh
# service cron restart 以重启 cron
# crontab -l 查看当前用户的定时任务
