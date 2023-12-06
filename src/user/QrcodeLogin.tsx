import { SA } from '@/errors/utils'
import { requestQrcodeToken } from '@/app/admin/user/server'
import { resolvePath } from '@/utils/url'

import RefreshIcon from '@mui/icons-material/Refresh'
import { Box, Button, CircularProgress, IconButton, Stack } from '@mui/material'
import { QRCodeSVG } from 'qrcode.react'
import useSWR from 'swr'
import { blue } from '@mui/material/colors'
import toast from 'react-hot-toast'
import { useMemo } from 'react'

import type { LoginType } from './type'

interface QrcodeLoginProps {
  loginType: LoginType
  setLoginType: React.Dispatch<React.SetStateAction<LoginType>>
}

export function QrcodeLogin({ loginType, setLoginType }: QrcodeLoginProps) {
  const { data, error, isValidating, mutate } = useSWR<string, Error>(
    ['requestQrcodeToken', loginType],
    () => {
      if (loginType === 'email') {
        throw new Error('不是二维码登录')
      }
      return requestQrcodeToken()
        .then(SA.decode)
        .catch((e) => {
          toast.error(e.message)
          throw e
        })
    }
  )
  const qrcodeStr = useMemo(() => {
    if (isValidating || error || !data) {
      return '数据加载未完成'
    }
    return resolvePath(`/qr-login?token=${data}`).href
  }, [data, error, isValidating])

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
