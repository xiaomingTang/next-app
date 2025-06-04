import { copyToClipboard } from '@/utils/copyToClipboard'
import { cat } from '@/errors/catchAndToast'

import { useRef, useState } from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'

import type { HTMLAttributes } from 'react'

const COPY_RESET_DELAY = 3000

export function MdPre(props: HTMLAttributes<HTMLPreElement>) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)
  const lastTimerRef = useRef(-1)

  const handleCopy = cat(async () => {
    const text = preRef.current?.textContent ?? ''
    await copyToClipboard(text.trim(), 'silently')
    setCopied(true)
    window.clearTimeout(lastTimerRef.current)
    lastTimerRef.current = window.setTimeout(
      () => setCopied(false),
      COPY_RESET_DELAY
    )
  })

  return (
    <Box sx={{ position: 'relative' }}>
      <pre {...props} ref={preRef} />
      <IconButton
        size='medium'
        onClick={handleCopy}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 1,
          boxShadow: 1,
          color: copied ? 'success.main' : 'grey.600',
          fontSize: '1.2em',
        }}
        aria-label={copied ? '已复制' : '复制'}
      >
        {copied ? (
          <CheckIcon fontSize='inherit' />
        ) : (
          <ContentCopyIcon fontSize='inherit' />
        )}
      </IconButton>
    </Box>
  )
}
