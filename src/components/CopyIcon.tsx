import { copyToClipboard } from '@/utils/copyToClipboard'

import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'
import { useRef, useState } from 'react'

import type { SvgIconProps } from '@mui/material'

interface CopyIconProps extends SvgIconProps {
  copied?: boolean
}

export function CopyIcon(props: CopyIconProps) {
  const { copied, ...rest } = props

  return copied ? <CheckIcon {...rest} /> : <ContentCopyIcon {...rest} />
}

const COPY_RESET_DELAY = 2000

export function useCopy() {
  const [copied, setCopied] = useState(false)
  const lastTimerRef = useRef(-1)

  const copy = (text: string) =>
    copyToClipboard(text, 'silently').then(() => {
      setCopied(true)
      window.clearTimeout(lastTimerRef.current)
      lastTimerRef.current = window.setTimeout(
        () => setCopied(false),
        COPY_RESET_DELAY
      )
    })

  return [copied, copy] as const
}
