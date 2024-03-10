import { usePeer } from '../store/usePeer'
import { useConnectionState } from '../hooks/usePeerState'
import {
  CONNECTION_STATE_MAP,
  CONNECTION_STATE_STATUS_MAP,
  TARGET_PID_SEARCH_PARAM,
} from '../constants'

import { cat } from '@/errors/catchAndToast'
import { useListen } from '@/hooks/useListen'
import { AnchorProvider } from '@/components/AnchorProvider'
import { openSimpleModal } from '@/components/SimpleModal'
import { stopStream } from '@/utils/media'

import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  OutlinedInput,
  Stack,
} from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { Controller, useForm } from 'react-hook-form'
import { useEffect, useMemo } from 'react'
import { noop } from 'lodash-es'
import toast from 'react-hot-toast'

import type { MediaConnection } from 'peerjs'

function useMediaConnectionHandler(connection?: MediaConnection | null) {
  const state = useConnectionState(connection ?? null)

  useListen(state, () => {
    if (CONNECTION_STATE_STATUS_MAP[state] === 'failed') {
      stopStream(connection?.localStream)
      connection?.close()
      toast.error(CONNECTION_STATE_MAP[state].text)
    }
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (
        connection &&
        connection.localStream?.active &&
        !connection.remoteStream?.active
      ) {
        stopStream(connection.localStream)
        connection.close()
        toast.error('连接超时')
      }
    }, 30 * 1000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [connection])
}

export function PeerConnections() {
  const { activeConnectionInfo, connectionInfos } = usePeer()
  const connection = activeConnectionInfo?.dc.out ?? null
  const state = useConnectionState(connection)
  const { handleSubmit, control, setValue } = useForm<{
    peerId: string
  }>({
    defaultValues: {
      peerId: '',
    },
  })

  useMediaConnectionHandler(activeConnectionInfo?.mc)

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
            <InputLabel htmlFor='connection-id' sx={{ userSelect: 'none' }}>
              我的连接
            </InputLabel>
            <OutlinedInput
              id='connection-id'
              label='我的连接'
              size='small'
              {...field}
              // 这种 hash, 自动填充没有意义, 反倒很乱
              autoComplete='off'
              endAdornment={
                connectionInfos.length > 1 && (
                  <AnchorProvider>
                    {(anchorEl, setAnchorEl) => (
                      <>
                        <InputAdornment position='end'>
                          <IconButton
                            aria-label='下拉展示所有连接'
                            edge='end'
                            onClick={(e) => {
                              setAnchorEl((prev) => {
                                if (!prev) {
                                  return e.currentTarget
                                }
                                return null
                              })
                            }}
                          >
                            <ArrowDropDownIcon />
                          </IconButton>
                        </InputAdornment>
                        <Menu
                          autoFocus
                          open={!!anchorEl}
                          anchorEl={anchorEl}
                          onClose={() => setAnchorEl(null)}
                        >
                          {connectionInfos.map((item) => (
                            <MenuItem
                              key={item.targetPeerId}
                              selected={
                                item.targetPeerId ===
                                activeConnectionInfo?.targetPeerId
                              }
                              onClick={() => {
                                usePeer.setState((prev) => ({
                                  activeConnectionInfo:
                                    prev.connectionInfos.find(
                                      (c) =>
                                        c.targetPeerId === item.targetPeerId
                                    ) ?? null,
                                }))
                                setAnchorEl(null)
                              }}
                            >
                              {item.targetPeerId}
                            </MenuItem>
                          ))}
                        </Menu>
                      </>
                    )}
                  </AnchorProvider>
                )
              }
            />
          </FormControl>
        )}
      />
      <Button
        type='submit'
        variant='outlined'
        color={connection ? CONNECTION_STATE_MAP[state].color : 'primary'}
        onClick={() => {
          if (state === 'failed') {
            openSimpleModal({
              title: '提示',
              content: (
                <ol style={{ listStyle: 'disc' }}>
                  <li>请检查连接 ID 是否正确 以及 确认对方连接是否可用；</li>
                  <li>如果使用了 VPN, 请关闭 VPN 后重试；</li>
                </ol>
              ),
            }).catch(noop)
          }
        }}
      >
        {!connection && '连接'}
        {connection && CONNECTION_STATE_MAP[state].text}
      </Button>
    </Stack>
  )
}
