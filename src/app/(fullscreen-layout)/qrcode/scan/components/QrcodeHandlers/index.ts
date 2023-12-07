import { isValidUrl } from '@/utils/url'

import { useRouter } from 'next/navigation'

export function useQrcodeHandler(qrcode?: string) {
  const router = useRouter()
  if (!qrcode || !isValidUrl(qrcode)) {
    return
  }
  const url = new URL(qrcode)
  if (window.location.host !== url.host) {
    return
  }
  router.replace(url.href)
}
