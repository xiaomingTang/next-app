这是 `16px.cc` 个人博客的源码

## Getting Started

0. 配置环境变量 (运行 `deploy.sh` 时需要这些环境变量)

   - `$P1_SSH_PASSWORD`
   - `$P1_SSH_USER`
   - `$P1_SSH_HOST`: 如 `175.178.99.99`
   - `$P1_REMOTE_PORT`: 如 `3000`
   - `$P1_REMOTE_DIR_WITHOUT_TAIL_SLASH`: 如 `/var/www/16px_cc`
   - `$P1_APP_NAME`: 如 `16px_cc`

1. 创建 `.env.local` 文件, 并根据 `.env` 文件, 补充里面需要的值
2. `pnpm i`
3. `pnpm dev`

## 服务端部署时的准备工作

由于 `peer-server` 全局安装时, 运行会报错, 所以只能项目内安装, 所以需要进入服务器, `cd` 到项目目录, 并安装依赖:

```cmd
pnpm i concurrently peer
```

## 部署到服务器

```cmd
pnpm run deploy
```
