import { usePeer } from '../store/usePeer'
import { useConnectionState } from '../hooks/usePeerState'
import { TARGET_PID_SEARCH_PARAM } from '../constants'

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
import { Controller, useForm } from 'react-hook-form'
import { useEffect, useMemo } from 'react'

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
  const { activeConnectionInfo } = usePeer()
  const connection = activeConnectionInfo?.dc.out ?? null
  const state = useConnectionState(connection)
  const { handleSubmit, control, setValue } = useForm<{
    peerId: string
  }>({
    defaultValues: {
      peerId: '',
    },
  })

  useListen(connection?.peer, (peerId) => {
    setValue('peerId', peerId ?? '')
  })

  const onSubmit = useMemo(
    () =>
      handleSubmit(
        cat(async (e) => {
          const { peerId } = e
          if (typeof peerId === 'string' && peerId) {
            usePeer.connect(peerId)
            // 发起连接后立即移除 url 上的 searchParam
            const url = new URL(window.location.href)
            url.searchParams.delete(TARGET_PID_SEARCH_PARAM)
            window.history.replaceState(null, '', url)
          }
        })
      ),
    [handleSubmit]
  )

  // 从 url 上获取 target peer id, 并填充到输入框中
  useEffect(() => {
    let timer = -1
    const url = new URL(window.location.href)
    const target = url.searchParams.get(TARGET_PID_SEARCH_PARAM)
    if (target) {
      setValue('peerId', target)
      timer = window.setTimeout(() => {
        onSubmit()
      }, 0)
    }
    return () => {
      window.clearTimeout(timer)
    }
  }, [onSubmit, setValue])

  return (
    <Stack
      component='form'
      direction='row'
      spacing={1}
      sx={{ width: '100%', maxWidth: '450px' }}
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
        color={connection ? CONNECTION_STATE_MAP[state].color : 'primary'}
      >
        {!connection && '连接'}
        {connection && CONNECTION_STATE_MAP[state].text}
      </Button>
    </Stack>
  )
}
