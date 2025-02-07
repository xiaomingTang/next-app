import { LyricItem } from '../Lyrics'

import { Box, TextField, Typography } from '@mui/material'
import { useState } from 'react'

interface LyricItemProps {
  lyricItem: LyricItem
  onChange?: (value: LyricItem) => void
}

export function LyricItemDom({ lyricItem, onChange }: LyricItemProps) {
  const { type, time: timestamp, value: text } = lyricItem
  const [editing, setEditing] = useState(false)
  const m = Math.floor(timestamp / 60)
    .toString()
    .padStart(2, '0')
  const s = Math.floor(timestamp % 60)
    .toString()
    .padStart(2, '0')
  const ms = Math.floor((timestamp % 1) * 1000)
    .toString()
    .padStart(3, '0')
    .slice(0, 2)

  if (editing) {
    return (
      <Box
        component='form'
        autoComplete='off'
        sx={{
          height: '42px',
        }}
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.target as HTMLFormElement)
          const str = (formData.get('content') ?? '') as string
          if (str !== lyricItem.toString()) {
            onChange?.(new LyricItem(str))
          }
          setEditing(false)
        }}
      >
        <TextField
          name='content'
          sx={{ width: '100%' }}
          key={lyricItem.toString()}
          defaultValue={lyricItem.toString()}
          autoFocus
          onBlur={(e) => {
            const str = e.target.value
            if (str !== lyricItem.toString()) {
              onChange?.(new LyricItem(str))
            }
            setEditing(false)
          }}
        />
      </Box>
    )
  }
  return (
    <Box
      sx={{
        height: '42px',
        py: 1,
        textAlign: type === 'lyric' ? 'left' : 'center',
        [`&:hover`]: {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
        },
      }}
      onDoubleClick={() => setEditing(true)}
    >
      {type !== 'lyric' && (
        <>
          <Typography
            component='code'
            className='text-gray-400'
            sx={{
              [`&:before`]: {
                content: '"元数据"',
                display: 'inline-block',
                px: 1,
                mr: 1,
                color: 'gray',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                borderRadius: '4px',
              },
            }}
          >
            [
          </Typography>
          <code>{type}</code>
          <code className='mx-1 text-gray-400'>:</code>
          <span>{text}</span>
          <code className='text-gray-400'>]</code>
        </>
      )}
      {type === 'lyric' && (
        <>
          <span className='inline-block w-28 text-right'>
            <code className='text-gray-400'>[</code>
            <code>{m}</code>
            <code className='mx-1'>:</code>
            <code>{s}</code>
            <code className='text-gray-400 ml-1'>.</code>
            <code className='text-gray-400'>{ms}</code>
            <code className='text-gray-400'>]</code>
          </span>
          <span> </span>
          <span className='ml-4'>{text}</span>
        </>
      )}
    </Box>
  )
}
