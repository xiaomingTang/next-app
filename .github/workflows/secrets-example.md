# GitHub Actions Secrets 配置示例

## 在 GitHub 仓库中需要配置的 Secrets

### 腾讯云 COS 相关

COS_SECRET_ID=AKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
COS_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
COS_REGION=ap-beijing
COS_BUCKET=your-bucket-name-1234567890

### Webhook 部署通知

WEBHOOK_URL=https://xxx.com/deploy/xxx.com

## 如何配置

1. 进入 GitHub 仓库页面
2. 点击 Settings 标签
3. 在左侧菜单中找到 "Secrets and variables" -> "Actions"
4. 点击 "New repository secret" 添加上述每个 secret

## 腾讯云 COS 配置说明

### 获取 SecretId 和 SecretKey

1. 登录腾讯云控制台
2. 访问 "访问管理" -> "API密钥管理"
3. 创建或查看现有的 API 密钥

### COS 区域代码参考

- ap-beijing: 北京
- ap-shanghai: 上海
- ap-guangzhou: 广州
- ap-chengdu: 成都
- ap-hongkong: 香港
- ap-singapore: 新加坡
- 更多区域请参考腾讯云 COS 文档

### 存储桶权限配置

确保 API 密钥具有目标存储桶的写入权限：

- cos:PutObject
- cos:PutObjectAcl (如需要)

可以通过 CAM 策略配置具体权限，建议只授予必要的最小权限。
