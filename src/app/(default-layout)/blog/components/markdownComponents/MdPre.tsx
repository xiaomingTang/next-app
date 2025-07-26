import { cat } from '@/errors/catchAndToast'
import { useHover } from '@/hooks/useHover'
import { Sticky } from '@/components/Sticky'
import { CopyIcon, useCopy } from '@/components/CopyIcon'

import { useRef } from 'react'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'

import type { HTMLAttributes } from 'react'

export function MdPre(props: HTMLAttributes<HTMLPreElement>) {
  const preRef = useRef<HTMLPreElement>(null)
  const [hovered, setHoverElem] = useHover()
  const [copied, copy] = useCopy()

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
          top: 'var(--header-height)',
        }}
        slogProps={{
          root: {
            sx: {
              // pre > code 的 zIndex: 1
              zIndex: 2,
            },
          },
        }}
      >
        <IconButton
          size='medium'
          onClick={cat(() => copy((preRef.current?.innerText || '').trim()))}
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
          <CopyIcon fontSize='inherit' copied={copied} />
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
