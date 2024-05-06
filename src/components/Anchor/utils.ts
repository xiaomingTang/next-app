import 'client-only'
import { resolvePath } from '@/utils/url'

const APP_URL = resolvePath('/')

export function onAnchorClick(e: React.MouseEvent<HTMLAnchorElement>) {
  const { href } = e.currentTarget
  if (!href) {
    return
  }
  const targetUrl = resolvePath(href)
  // 站内 url
  const isInternal = resolvePath(href || '').hostname.endsWith(APP_URL.hostname)
  if (!isInternal || targetUrl.pathname !== window.location.pathname) {
    return
  }
  const hash = decodeURI(targetUrl.hash)
  const hashElement = document.querySelector(hash)
  if (!hashElement) {
    return
  }
  /**
   * 如果目标 url 是跳转到当前页某个 hash，
   * 则直接滚动到目标 hash element，
   * 而不使用 anchor url 跳转
   */
  e.preventDefault()
  window.history.replaceState(null, '', targetUrl)
  hashElement.scrollIntoView({ behavior: 'smooth' })
}
