这是 `16px.cc` 个人博客的源码

# Prepare

- 创建 `.env.local` 文件, 并根据 `.env` 文件, 补充里面需要的值
- 如果需要部署 (`需要执行 docker:build`), 则还需要创建 `.env.deploy.local` 文件, 并根据 `.env` 文件, 补充里面需要的值
  - 云服务器上需要安装 `dotenv-cli` (`pnpm i -g dotenv-cli`)
  - 云服务器上需要安装 `pm2` (`pnpm i -g pm2`)
- 创建数据库并授予访问权限（此处配置了外网访问，如果不需要外网访问，命令需要调整）
  - 创建数据库 `CREATE DATABASE your_db_name  DEFAULT CHARACTER SET = 'utf8mb4';`
  - 创建用户 `CREATE USER 'your_db_user_name'@'%' IDENTIFIED BY 'your_password';`
  - 授予访问权限 `GRANT ALL PRIVILEGES ON your_db_name.* TO 'your_db_user_name'@'%';`
  - 刷新权限 `FLUSH PRIVILEGES;`
- pnpm 全局安装 peer 运行不起来，npm 可以：
  ```cmd
  npm i concurrently peer
  ```

## Getting started

- `pnpm i`
- `pnpm dev`

## Deploy

1. `pnpm run docker:build-base`
   - 这条命令平常的时候构建一次，用于生成基础景象，不必每次部署都执行
2. `dotenv -e .env.deploy -c -- pnpm run docker:build`
   - `dotenv -e .env.deploy -c -- pnpm run xxx` 利用 [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) 以 `.env.deploy.local` 作为环境变量 provider 来执行命令
3. 构建产物部署到云服务器
   - `pnpm run docker:deploy` (自动从 `.env.deploy` 取环境变量)

### Read more

构建产物部署到云服务器有两种方式，根据自己的喜好选择：

- 直接把 docker 上传到云
  - 优点：不限制云的环境，只要能运行 docker 就行
  - 缺点：因为自带 node 及其他环境，所以体积较大（一个空的 node:22-alpine 就已经 200+MB 了）
- 从 docker 里面把文件取出来，上传到云 (`pnpm run docker:deploy` 就是干这个的)
  - 优点：仅有项目构建产物，体积很小，不到 50M (目前 gzip 后 40+MB)
  - 缺点：docker 需要与云上环境维持一致

### acme 配置

- 配置好 `Tencent_SecretId` 和 `Tencent_SecretKey`
  - 见 [acme.sh 自动解析并申请证书](https://cloud.tencent.com/document/product/302/105900)
- 申请证书
  ```
  acme.sh --issue -d domain.com -d "*.domain.com" --dns dns_tencent --reloadcmd "/var/reload_services.sh" --debug
  ```
- 安装证书
  ```
  acme.sh --install-cert -d domain.com -d "*.domain.com" \
      --key-file /path/to/your/customized/dir/domain.key \
      --fullchain-file /path/to/your/customized/dir/fullchain.cer \
      --reloadcmd "/var/reload_services.sh"
  ```
- 配置 nginx `ssl_certificate` & `ssl_certificate_key`
