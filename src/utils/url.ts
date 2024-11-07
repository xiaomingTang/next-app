import { ENV_CONFIG } from '@/config'

export function resolvePath(pathname: string | URL) {
  return new URL(pathname, ENV_CONFIG.public.origin)
}

export function resolveCDN(pathname: string | URL) {
  return new URL(pathname, process.env.NEXT_PUBLIC_CDN_ROOT)
}

export function isValidUrl(s: string) {
  try {
    // 尝试创建 URL 对象
    const parsedURL = new URL(s)

    // 如果 URL 协议不是 "http" 或 "https"，视为非法
    if (parsedURL.protocol !== 'http:' && parsedURL.protocol !== 'https:') {
      return false
    }

    // 其他验证逻辑可以根据需要添加

    // URL 符合规范，认为是合法的
    return true
  } catch (_) {
    // 捕获异常表示 URL 不合法
    return false
  }
}

const tempUrl = resolvePath('/')

export function normalizePathname(pathname: string): string {
  tempUrl.pathname = pathname
  // 移除首尾的斜杠，处理多个连续斜杠，转换为小写
  return tempUrl.pathname
    .replace(/\/+/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase()
}
