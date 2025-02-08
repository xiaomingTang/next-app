import { LyricItem } from '../Lyrics'

import { customConfirm } from '@/utils/customConfirm'
import { SilentError } from '@/errors/SilentError'
import { cat } from '@/errors/catchAndToast'

import {
  Box,
  ClickAwayListener,
  colors,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import { useState } from 'react'

import type { FormEvent } from 'react'

interface LyricItemProps {
  lyricItem: LyricItem
  onChange?: (value: LyricItem) => void
}

/**
 * 帮助校验笔误
 */
async function checkLrcContent(str: string, prevLyricItem: LyricItem) {
  const match = str.match(/(\d\d：\d\d)/)
  if (match) {
    if (
      await customConfirm(
        `注意到你的【${match[0]}】是中文冒号，仍要继续吗？`,
        'SLIGHT'
      )
    ) {
      return str
    }
    throw new SilentError('用户取消操作')
  }
  const newLyricItem = new LyricItem(str)
  if (newLyricItem.type === prevLyricItem.type) {
    return str
  }
  if (prevLyricItem.type === 'lyric') {
    if (
      await customConfirm(
        `【普通歌词】将会改为【元数据】，可能是由中文冒号笔误导致的，仍要继续吗？`,
        'SLIGHT'
      )
    ) {
      return str
    }
    throw new SilentError('用户取消操作')
  }
  if (newLyricItem.type === 'lyric') {
    if (
      await customConfirm(
        `【元数据】将会改为【普通歌词】，可能是由中文冒号笔误导致的，仍要继续吗？`,
        'SLIGHT'
      )
    ) {
      return str
    }
    throw new SilentError('用户取消操作')
  }
  return str
}

export function LyricItemDom({ lyricItem, onChange }: LyricItemProps) {
  const theme = useTheme()
  const { type, time: timestamp, value: text } = lyricItem
  const [editing, setEditing] = useState(false)
  const [newStr, setNewStr] = useState(lyricItem.toString())

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
      <ClickAwayListener
        onClickAway={cat(async () => {
          const str = await checkLrcContent(newStr, lyricItem)
          if (str !== lyricItem.toString()) {
            onChange?.(new LyricItem(str))
          }
          setEditing(false)
        })}
      >
        <Box
          component='form'
          autoComplete='off'
          sx={{
            height: '42px',
          }}
          onSubmit={cat(async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            const str = await checkLrcContent(newStr, lyricItem)
            if (str !== lyricItem.toString()) {
              onChange?.(new LyricItem(str))
            }
            setEditing(false)
          })}
        >
          <TextField
            name='content'
            sx={{ width: '100%' }}
            key={lyricItem.toString()}
            autoFocus
            value={newStr}
            onChange={(e) => setNewStr(e.target.value)}
          />
        </Box>
      </ClickAwayListener>
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
      onDoubleClick={(e) => {
        e.stopPropagation()
        setEditing(true)
      }}
    >
      {type !== 'lyric' && (
        <>
          <Typography
            component='code'
            sx={{
              color: theme.palette.grey[400],
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
          <code className='mx-1 text-grey-400'>:</code>
          <span>{text}</span>
          <code className='text-grey-400'>]</code>
        </>
      )}
      {type === 'lyric' && (
        <>
          <span className='inline-block w-28 text-right'>
            <code className='text-grey-400'>[</code>
            <code>{m}</code>
            <code className='mx-1'>:</code>
            <code>{s}</code>
            <code className='text-grey-400 ml-1'>.</code>
            <code className='text-grey-400'>{ms}</code>
            <code className='text-grey-400'>]</code>
          </span>
          <span> </span>
          <Typography
            component='span'
            sx={{
              ml: 1,
              [`&:before`]: {
                content: !text.trim() ? '"双击可编辑该行"' : '""',
                display: 'inline-block',
                color: colors.grey[400],
              },
            }}
          >
            {text}
          </Typography>
        </>
      )}
    </Box>
  )
}
