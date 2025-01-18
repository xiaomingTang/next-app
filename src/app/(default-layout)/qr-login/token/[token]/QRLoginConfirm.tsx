'use client'

import { confirmQrcodeLogin } from '@/app/admin/user/server'
import { LinkWithReplace } from '@/components/CustomLink'
import { SA } from '@/errors/utils'
import { useLoading } from '@/hooks/useLoading'
import { cat } from '@/errors/catchAndToast'

import { Box, Button, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'

import type { FormEvent } from 'react'

export function QRLoginConfirm({ token = '' }: { token?: string }) {
  const router = useRouter()
  const [loading, withLoading] = useLoading()

  const onSubmit = withLoading(
    cat(async (e: FormEvent) => {
      e.preventDefault()
      try {
        await confirmQrcodeLogin(token).then(SA.decode)
        router.replace('/qr-login/status/success')
      } catch (error) {
        router.replace('/qr-login/status/failed')
        throw error
      }
    })
  )

  return (
    <Box
      component='form'
      onSubmit={onSubmit}
      sx={{
        width: '100%',
        maxWidth: '300px',
        mx: 'auto',
        textAlign: 'center',
      }}
    >
      <input type='hidden' value={token} />
      <Typography>你正在进行</Typography>
      <Typography
        sx={{
          mb: 2,
          fontSize: '1.5em',
          fontWeight: 'bold',
        }}
      >
        扫码授权登录
      </Typography>
      <Button fullWidth loading={loading} variant='contained' type='submit'>
        确认授权登录
      </Button>
      <Button fullWidth LinkComponent={LinkWithReplace} href='/qrcode/scan'>
        重新扫码
      </Button>
    </Box>
  )
}
