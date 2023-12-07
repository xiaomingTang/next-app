import { LinkWithReplace } from '@/components/CustomLink'

import { Box, Button, Typography } from '@mui/material'

export function QRLoginStatus({ status }: { status: 'success' | 'failed' }) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '300px',
        mx: 'auto',
        textAlign: 'center',
      }}
    >
      {status === 'success' && (
        <>
          <Typography color='primary' fontWeight='bold' mb={2}>
            扫码登录成功
          </Typography>
          <Button
            fullWidth
            variant='contained'
            size='large'
            LinkComponent={LinkWithReplace}
            href='/'
          >
            好的
          </Button>
        </>
      )}
      {status === 'failed' && (
        <>
          <Typography color='error' fontWeight='bold' mb={2}>
            扫码登录失败
          </Typography>
          <Button
            fullWidth
            variant='contained'
            size='large'
            LinkComponent={LinkWithReplace}
            href='/qrcode/scan'
          >
            重新扫码
          </Button>
        </>
      )}
    </Box>
  )
}
