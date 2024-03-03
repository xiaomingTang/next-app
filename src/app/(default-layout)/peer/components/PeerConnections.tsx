import { usePeer } from '../store/usePeer'
import { useConnectionState } from '../hooks/usePeerState'

import { cat } from '@/errors/catchAndToast'
import { useListen } from '@/hooks/useListen'

import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
} from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes'
import { Controller, useForm } from 'react-hook-form'
import { useMemo } from 'react'

import type { ButtonOwnProps } from '@mui/material'

const CONNECTION_STATE_MAP: Record<
  RTCIceConnectionState,
  {
    text: string
    color: Required<ButtonOwnProps['color']>
  }
> = {
  checking: {
    text: '连接中...',
    color: 'info',
  },
  closed: {
    text: '连接已关闭',
    color: 'error',
  },
  completed: {
    text: '连接已结束',
    color: 'error',
  },
  connected: {
    text: '已连接',
    color: 'primary',
  },
  disconnected: {
    text: '连接已断开',
    color: 'error',
  },
  failed: {
    text: '连接失败',
    color: 'error',
  },
  new: {
    text: '连接中...',
    color: 'info',
  },
}

export function PeerConnections() {
  const { activeConnection } = usePeer()
  const state = useConnectionState(activeConnection.connection)
  const { handleSubmit, control, setValue } = useForm<{
    peerId: string
  }>({
    defaultValues: {
      peerId: '',
    },
  })

  useListen(activeConnection.connection?.peer, (peerId) => {
    setValue('peerId', peerId ?? '')
  })

  const onSubmit = useMemo(
    () =>
      handleSubmit(
        cat(async (e) => {
          const { peerId } = e
          if (typeof peerId === 'string' && peerId) {
            usePeer.connect(peerId)
          }
        })
      ),
    [handleSubmit]
  )

  return (
    <Stack
      component='form'
      direction='row'
      spacing={1}
      sx={{ width: '100%', maxWidth: '410px', alignItems: 'center' }}
      onSubmit={onSubmit}
    >
      <Controller
        name='peerId'
        control={control}
        render={({ field }) => (
          <FormControl sx={{ flexGrow: 1 }} size='small' variant='outlined'>
            <InputLabel htmlFor='connection-id'>我的连接</InputLabel>
            <OutlinedInput
              label='我的连接'
              size='small'
              {...field}
              // 这种 hash, 自动填充没有意义, 反倒很乱
              autoComplete='off'
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton aria-label='下拉展示所有连接' edge='end'>
                    <ArrowDropDownIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        )}
      />
      <Button
        type='submit'
        variant='outlined'
        color={
          activeConnection.connection
            ? CONNECTION_STATE_MAP[state].color
            : 'primary'
        }
      >
        {!activeConnection.connection && '连接'}
        {activeConnection.connection && (
          <>
            {CONNECTION_STATE_MAP[state].text}
            {activeConnection.type === 'media' && (
              <PhotoCameraIcon fontSize='inherit' sx={{ ml: 1 }} />
            )}
            {activeConnection.type === 'data' && (
              <SpeakerNotesIcon fontSize='inherit' sx={{ ml: 1 }} />
            )}
          </>
        )}
      </Button>
    </Stack>
  )
}
