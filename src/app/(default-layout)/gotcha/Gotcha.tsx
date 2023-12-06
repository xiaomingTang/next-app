'use client'

import { cat } from '@/errors/catchAndToast'

import {
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Tooltip,
  Typography,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { noop } from 'lodash-es'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

const requestWithTimeout = async (
  url: string | URL,
  timeout: number
): Promise<Response> => {
  const controller = new AbortController()

  // 设置超时
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeout)

  const response = await fetch(url, {
    signal: controller.signal,
    mode: 'no-cors',
  })

  // 清除超时计时器
  clearTimeout(timeoutId)

  return response
}

interface VisitStatus {
  url: URL
  visited: boolean
}

export function Gotcha() {
  const paramHostname = useSearchParams().get('hostname') ?? ''
  const [visitStatus, setVisitStatus] = useState<VisitStatus | null>(null)
  const { handleSubmit, control } = useForm<{ hostname: string }>({
    defaultValues: {
      hostname: paramHostname,
    },
  })
  const onSubmit = handleSubmit(
    cat(async ({ hostname }) => {
      const match = /^(([a-zA-Z0-9-_]+)\.)+([a-zA-Z0-9-_]+)$/.exec(hostname)
      if (!match) {
        throw new Error('无效网址')
      }
      const hostnameNoWww = match[0].replace(/^www\./i, '')
      const urlNoWww = new URL(`https://${hostnameNoWww}/favicon.ico`)
      const urlWithWww = new URL(`https://www.${hostnameNoWww}/favicon.ico`)
      console.time(hostname)
      // 带 www 或不带 www 的 favicon, 如果存在缓存, 则应该能在 50 ms 内返回
      const res = await Promise.race([
        requestWithTimeout(urlNoWww, 50).catch(noop),
        requestWithTimeout(urlWithWww, 50).catch(noop),
      ])
      console.timeEnd(hostname)
      setVisitStatus({
        url: new URL(`https://${hostname}`),
        visited: !!res,
      })
    })
  )

  return (
    <>
      <Typography>
        我能知道你最近有没有访问过某个网站
        <Tooltip title='仅供娱乐 😄'>
          <IconButton sx={{ p: 0, mx: 1, fontSize: 'inherit' }}>
            <HelpOutlineIcon sx={{ fontSize: 'inherit' }} />
          </IconButton>
        </Tooltip>
      </Typography>
      <Typography>试试？</Typography>
      <Box component='form' onSubmit={onSubmit} sx={{ my: 1 }}>
        <Controller
          name='hostname'
          control={control}
          render={({ field, fieldState: { error } }) => (
            <FormControl error={!!error}>
              <InputLabel>网址</InputLabel>
              <OutlinedInput
                {...field}
                label='网址'
                placeholder='如 google.com'
                onChange={(e) => {
                  setVisitStatus(null)
                  field.onChange(e)
                }}
                endAdornment={
                  <InputAdornment position='end'>
                    <IconButton
                      className='text-primary-main'
                      aria-label='上传'
                      type='submit'
                    >
                      <TravelExploreIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
              <FormHelperText>{error?.message ?? ' '}</FormHelperText>
            </FormControl>
          )}
          rules={{
            required: {
              value: true,
              message: '必填项',
            },
            pattern: {
              value: /^(([a-zA-Z0-9-_]+)\.)+([a-zA-Z0-9-_]+)$/,
              message: '请填写有效的网址，如 google.com',
            },
          }}
        />
      </Box>
      <Typography
        sx={{
          color: visitStatus?.visited ? 'green' : 'red',
        }}
      >
        {visitStatus &&
          visitStatus.visited &&
          `你应该访问过 ${visitStatus.url.host}`}
        {visitStatus &&
          !visitStatus.visited &&
          `你应该没有访问过 ${visitStatus.url.host}`}
      </Typography>
    </>
  )
}
