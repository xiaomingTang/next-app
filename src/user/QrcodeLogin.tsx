import { SA } from '@/errors/utils'
import {
  disableQrcodeToken,
  requestQrcodeLogin,
  requestQrcodeToken,
} from '@/app/admin/user/server'
import { resolvePath } from '@/utils/url'

import RefreshIcon from '@mui/icons-material/Refresh'
import { Box, Button, CircularProgress, IconButton, Stack } from '@mui/material'
import { QRCodeSVG } from 'qrcode.react'
import useSWR from 'swr'
import { blue } from '@mui/material/colors'
import toast from 'react-hot-toast'
import { useEffect, useMemo, useRef } from 'react'
import { useModal } from '@ebay/nice-modal-react'
import { noop } from 'lodash-es'

import type { LoginType } from './type'

interface QrcodeLoginProps {
  loginType: LoginType
  setLoginType: React.Dispatch<React.SetStateAction<LoginType>>
}

export function QrcodeLogin({ loginType, setLoginType }: QrcodeLoginProps) {
  const prevTokenRef = useRef('')
  const modal = useModal()
  const {
    data: token = '',
    error,
    isValidating,
    mutate,
  } = useSWR<string, Error>(
    loginType === 'qrcode' ? 'requestQrcodeToken' : null,
    () =>
      requestQrcodeToken(prevTokenRef.current)
        .then(SA.decode)
        .then((res) => {
          prevTokenRef.current = res.token
          return res.token
        })
        .catch((e) => {
          toast.error(e.message)
          throw e
        }),
    {
      refreshInterval: 60 * 1000,
    }
  )

  useSWR(
    token && !isValidating ? 'requestQrcodeLogin' : null,
    async () =>
      requestQrcodeLogin(token)
        .then(SA.decode)
        .then((user) => {
          modal.resolve(user)
          modal.hide()
        })
        .catch(noop),
    {
      refreshInterval: 1 * 1000,
    }
  )

  const qrcodeStr = useMemo(() => {
    if (isValidating || error || !token) {
      return '数据加载未完成'
    }
    return resolvePath(`/qr-login/token/${token}`).href
  }, [token, error, isValidating])

  useEffect(
    () => () => {
      // 如果离开 qrcode
      if (loginType === 'qrcode' && prevTokenRef.current) {
        disableQrcodeToken(prevTokenRef.current)
      }
    },
    [loginType]
  )

  if (loginType !== 'qrcode') {
    return <></>
  }

  return (
    <Stack spacing={2} alignItems='center'>
      <Box
        sx={{
          position: 'relative',
        }}
      >
        <QRCodeSVG
          value={qrcodeStr}
          size={148}
          style={{
            opacity: isValidating || error ? 0.2 : 1,
            transition: 'opacity 0.3s',
          }}
        />
        {isValidating && (
          <Box
            sx={{
              position: 'absolute',
              display: 'flex',
              zIndex: 1,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
            }}
          >
            <CircularProgress
              size={24}
              sx={{
                color: blue[500],
              }}
            />
          </Box>
        )}
        {!isValidating && error && (
          <IconButton
            size='large'
            sx={{
              position: 'absolute',
              display: 'flex',
              zIndex: 1,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
            }}
            onClick={() => mutate()}
          >
            <RefreshIcon />
          </IconButton>
        )}
      </Box>
      <Button fullWidth onClick={() => setLoginType('email')}>
        切换邮箱登录
      </Button>
    </Stack>
  )
}
