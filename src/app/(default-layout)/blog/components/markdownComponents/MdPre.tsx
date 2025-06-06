import { copyToClipboard } from '@/utils/copyToClipboard'
import { cat } from '@/errors/catchAndToast'
import { useHover } from '@/hooks/useHover'
import { Sticky } from '@/components/Sticky'
import { useHeaderState } from '@/layout/DefaultHeader'

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
  const [hovered, setHoverElem] = useHover()
  const { visualHeight } = useHeaderState()

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
    <Box
      ref={setHoverElem}
      sx={{
        position: 'relative',
      }}
    >
      <Sticky
        sx={{
          height: '40px',
          pointerEvents: 'none',
          transition: 'top 0.3s ease',
        }}
        style={{
          top: `${visualHeight}px`,
        }}
      >
        <IconButton
          size='medium'
          onClick={handleCopy}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            boxShadow: 1,
            color: copied ? 'success.main' : 'grey.600',
            fontSize: '1.2em',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'auto',
            ':focus-within': {
              opacity: 1,
            },
          }}
          aria-label={copied ? '已复制' : '复制后面的代码块内的内容'}
        >
          {copied ? (
            <CheckIcon fontSize='inherit' />
          ) : (
            <ContentCopyIcon fontSize='inherit' />
          )}
        </IconButton>
      </Sticky>
      <pre
        {...props}
        ref={preRef}
        tabIndex={0}
        role='region'
        aria-label='代码块'
      />
    </Box>
  )
}
