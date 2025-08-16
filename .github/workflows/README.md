# GitHub Actions 部署配置说明

## 概述

这个 GitHub Actions 工作流会在推送 tag 时自动构建项目并部署到腾讯云对象存储(COS)，然后调用 webhook 进行部署。

## 配置步骤

### 1. 在 GitHub 仓库中设置 Secrets

进入你的 GitHub 仓库 -> Settings -> Secrets and variables -> Actions，添加以下 secrets：

#### 腾讯云 COS 配置

- `COS_SECRET_ID`: 腾讯云 SecretId
- `COS_SECRET_KEY`: 腾讯云 SecretKey
- `COS_REGION`: COS 存储桶所在地域，如 `ap-beijing`、`ap-guangzhou` 等
- `COS_BUCKET`: COS 存储桶名称

#### Webhook 配置

- `WEBHOOK_URL`: 部署 webhook 地址，如 `https://xxx.com/deploy/xxx.com`

### 2. 腾讯云 COS 权限配置

确保你的腾讯云 API 密钥具有以下权限：

- COS 对象写入权限 (`cos:PutObject`)
- 对目标存储桶的访问权限

### 3. 触发部署

当你推送一个 tag 时，工作流会自动触发：

```bash
# 创建并推送 tag
git tag v1.0.0
git push origin v1.0.0
```

## 工作流程

1. **环境准备**: 使用 Ubuntu 22.04 + Node.js 22 + pnpm 10
2. **依赖安装**: 安装项目依赖 (`pnpm install --frozen-lockfile`)
3. **项目构建**: 执行 `pnpm run build`
4. **打包部署文件**:
   - 复制 `.next/standalone/*` 到部署包
   - 复制 `.next/static/*` 到部署包
   - 复制 `public/` 目录
   - 复制其他必要文件（如 `launch.sh`、`.ssl`、`.bak`、`ci` 等，如果存在）
   - 创建 `app.tar.gz` 压缩包
5. **上传到 COS**: 将压缩包上传到腾讯云对象存储
   - 路径格式: `releases/{tag_name}_{timestamp}/app.tar.gz`
6. **调用 Webhook**: 发送部署通知到指定的 webhook 地址

## Webhook 载荷格式

webhook 会收到以下 JSON 数据：

```json
{
  "event": "deploy",
  "tag": "v1.0.0",
  "cos_object_key": "releases/v1.0.0_20250816_120000/app.tar.gz",
  "repository": "xiaomingTang/next-app",
  "commit_sha": "abc123...",
  "commit_message": "Release v1.0.0",
  "timestamp": "2025-08-16T12:00:00Z"
}
```

## 故障排查

### 常见问题

1. **构建失败**: 检查 Node.js 版本、依赖版本是否兼容
2. **上传失败**: 检查腾讯云 API 密钥和存储桶配置
3. **Webhook 失败**: 检查 webhook URL 是否正确，服务是否可用

### 查看日志

在 GitHub 仓库的 Actions 标签页可以查看详细的构建和部署日志。

## 自定义配置

如果需要修改部署包内容，可以编辑 `.github/workflows/deploy.yml` 文件中的 "Create deployment archive" 步骤。

如果需要修改 webhook 载荷格式，可以编辑 "Call deployment webhook" 步骤中的 JSON 数据。
