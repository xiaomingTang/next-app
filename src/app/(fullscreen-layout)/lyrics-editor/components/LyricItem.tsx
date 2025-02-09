import { useLyricsEditorAudio } from './store'

import { LyricItem } from '../Lyrics'

import { customConfirm } from '@/utils/customConfirm'
import { SilentError } from '@/errors/SilentError'
import { cat } from '@/errors/catchAndToast'
import { useKeyDown } from '@/hooks/useKey'

import {
  Box,
  ClickAwayListener,
  colors,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import { useRef, useState } from 'react'

import type { FormEvent } from 'react'

interface LyricItemProps {
  lyricItem: LyricItem
  onChange?: (value: LyricItem) => void
  onDelete?: () => void
  onInsertBefore?: (value?: LyricItem) => void
  onInsertAfter?: (value?: LyricItem) => void
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

export function LyricItemDom({
  lyricItem,
  onChange,
  onDelete,
  onInsertBefore,
  onInsertAfter,
}: LyricItemProps) {
  const prevPlayingRef = useRef(false)
  const theme = useTheme()
  const { type, time: timestamp, value: text } = lyricItem
  const [editing, setEditing] = useState(false)
  const [newStr, setNewStr] = useState(lyricItem.toString())

  useKeyDown((e) => {
    if (e.key === 'Escape' && editing) {
      setNewStr(lyricItem.toString())
      setEditing(false)
      if (prevPlayingRef.current) {
        void useLyricsEditorAudio.getState().controls.play()
      }
    }
  })

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
          if (prevPlayingRef.current) {
            void useLyricsEditorAudio.getState().controls.play()
          }
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
            if (prevPlayingRef.current) {
              void useLyricsEditorAudio.getState().controls.play()
            }
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
        position: 'relative',
        height: '42px',
        py: 1,
        textAlign: type === 'lyric' ? 'left' : 'center',
        [`& > .visible-when-parent-hover`]: {
          display: 'none',
        },
        [`&:hover`]: {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          [`& > .visible-when-parent-hover`]: {
            display: 'inline-flex',
          },
        },
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        setEditing(true)
        const state = useLyricsEditorAudio.getState()
        prevPlayingRef.current = state.state.playing
        void state.controls.pause()
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
      <IconButton
        className='visible-when-parent-hover'
        onClick={(e) => {
          e.stopPropagation()
          onDelete?.()
        }}
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          m: 'auto',
          color: theme.palette.error.main,
        }}
      >
        <DeleteIcon />
      </IconButton>
      <IconButton
        className='visible-when-parent-hover'
        sx={{
          position: 'absolute',
          left: '50%',
          top: 0,
          transform: 'translate(-50%, -50%)',
          color: theme.palette.primary.main,
        }}
        onClick={(e) => {
          e.stopPropagation()
          onInsertBefore?.()
        }}
      >
        <AddCircleIcon />
      </IconButton>
      <IconButton
        className='visible-when-parent-hover'
        sx={{
          position: 'absolute',
          left: '50%',
          bottom: 0,
          transform: 'translate(-50%, 50%)',
          color: theme.palette.primary.main,
        }}
        onClick={(e) => {
          e.stopPropagation()
          onInsertAfter?.()
        }}
      >
        <AddCircleIcon />
      </IconButton>
    </Box>
  )
}
