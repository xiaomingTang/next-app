export function getCdnUrl(props?: { key?: string }) {
  const key = props?.key ?? '/'

  // TODO: 改成 CDN 的值
  const url = new URL(process.env.NEXT_PUBLIC_CDN_ROOT)
  url.pathname = key
  return url
}
