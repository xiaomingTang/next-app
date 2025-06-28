import Anchor from '@/components/Anchor'
import { resolvePath } from '@/utils/url'
import { formatText } from '@/utils/string'
import { copyToClipboard } from '@/utils/copyToClipboard'

import { Box, IconButton } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { matchRemotePattern } from 'next/dist/shared/lib/match-remote-pattern'

import type { RemotePattern } from 'next/dist/shared/lib/image-config'

const thisSiteUrl = resolvePath('/')

function formatIframeSrc(src?: string) {
  if (!src) {
    return null
  }
  const srcUrl = resolvePath(src)
  if (srcUrl.host === 'bilibili.com' || srcUrl.host.endsWith('.bilibili.com')) {
    srcUrl.searchParams.set('autoplay', '0')
    return srcUrl
  }
  /**
   * youtube 嵌入网址必须为:
   * https://www.youtube.com/embed/yU-GOqtFei0
   */
  if (srcUrl.host === 'youtube.com' || srcUrl.host.endsWith('.youtube.com')) {
    // https://www.youtube.com/watch?v=yU-GOqtFei0
    if (srcUrl.pathname === '/watch' && srcUrl.searchParams.get('v')) {
      srcUrl.pathname = `/embed/${srcUrl.searchParams.get('v')}`
      return srcUrl
    }
  }
  // https://youtu.be/yU-GOqtFei0
  if (srcUrl.host === 'youtu.be' || srcUrl.host.endsWith('.youtu.be')) {
    srcUrl.host = 'youtube.com'
    srcUrl.pathname = `/embed${srcUrl.pathname}`
    return srcUrl
  }

  // 以下是所有白名单
  const whiteListPatterns: RemotePattern[] = [
    { hostname: thisSiteUrl.hostname },
    { hostname: `**.${thisSiteUrl.hostname}` },
    { hostname: '16px.cc' },
    { hostname: 'youtu.be' },
    { hostname: 'youtube.com' },
    { hostname: 'bilibili.com' },
    { hostname: '**.16px.cc' },
    { hostname: '**.youtu.be' },
    { hostname: '**.youtube.com' },
    { hostname: '**.bilibili.com' },
  ]

  if (
    whiteListPatterns.some((pattern) => matchRemotePattern(pattern, srcUrl))
  ) {
    return srcUrl
  }
  return null
}

export function MdIframe({ src = '' }: { src?: string }) {
  const srcUrl = formatIframeSrc(src)

  if (!srcUrl) {
    return null
  }

  const linkStr = `${srcUrl.host}${formatText(srcUrl.pathname, 12, 5)}${formatText(srcUrl.search, 5, 5)}${formatText(srcUrl.hash, 5, 5)}`

  return (
    <>
      <Box sx={{ mb: 1 }}>
        <Anchor href={srcUrl.href} target='_blank' title={srcUrl.href}>
          {linkStr}
          <OpenInNewIcon fontSize='small' />
        </Anchor>
        <IconButton
          aria-label='复制链接'
          sx={{ ml: 1 }}
          onClick={() => copyToClipboard(srcUrl.href)}
        >
          <ContentCopyIcon fontSize='small' />
        </IconButton>
      </Box>
      <iframe
        src={srcUrl.href}
        width={720}
        height={450}
        allowFullScreen
        allow='accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share'
        style={{
          width: '100%',
          maxHeight: 'calc(var(--vh)*80)',
        }}
      />
    </>
  )
}
