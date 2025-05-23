import { usePeer } from '../store'
import { useConnectionState } from '../hooks/usePeerState'
import { CONNECTION_STATE_MAP, TARGET_PID_SEARCH_PARAM } from '../constants'

import { cat } from '@/errors/catchAndToast'
import { AnchorProvider } from '@/components/AnchorProvider'
import { isValidUrl } from '@/utils/url'
import { toError } from '@/errors/utils'
import { useListen } from '@/hooks/useListen'

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
import toast from 'react-hot-toast'

export function PeerConnections() {
  const connectionInfos = Object.values(usePeer((state) => state.members))
  const activeConnectionInfo = usePeer.useActiveMember()
  const connection = activeConnectionInfo?.dc ?? null
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
        cat((e) => {
          let peerId = e.peerId
          if (isValidUrl(e.peerId)) {
            // 如果用户输入的是一个 url, 那么就从 url 中获取 peerId
            // 并更新输入框中的内容
            const url = new URL(e.peerId)
            peerId = url.searchParams.get(TARGET_PID_SEARCH_PARAM) ?? ''
            setValue('peerId', peerId)
          }
          if (peerId) {
            return usePeer.connect(peerId)
          }
        })
      ),
    [handleSubmit, setValue]
  )

  // 从 url 上获取 target peer id, 并填充到输入框中
  useEffect(() => {
    const url = new URL(window.location.href)
    const target = url.searchParams.get(TARGET_PID_SEARCH_PARAM)
    if (target) {
      setValue('peerId', target)
      void usePeer
        .connect(target)
        .then(() => {
          // 发起连接后立即移除 url 上的 searchParam
          const url = new URL(window.location.href)
          url.searchParams.delete(TARGET_PID_SEARCH_PARAM)
          window.history.replaceState(null, '', url)
        })
        .catch((e) => {
          toast.error(toError(e).message)
        })
    }
  }, [setValue])

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
                              key={item.peerId}
                              selected={
                                item.peerId === activeConnectionInfo?.peerId
                              }
                              onClick={() => {
                                usePeer.setState({
                                  activeMemberId: item.peerId,
                                })
                                setAnchorEl(null)
                              }}
                            >
                              {item.peerId}
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
        rules={{
          required: {
            value: true,
            message: '必填项',
          },
        }}
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
