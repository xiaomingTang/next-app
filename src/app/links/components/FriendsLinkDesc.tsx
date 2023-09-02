'use client'

import { editFriendsLink } from './EditLink'

import Anchor from '@/components/Anchor'
import { ENV_CONFIG } from '@/config'
import { cat } from '@/errors/catchAndToast'
import { AnchorProvider } from '@/components/AnchorProvider'

import { Box, Button, Collapse, Link, Typography, styled } from '@mui/material'
import toast from 'react-hot-toast'

const logo = new URL(
  '/pwa/android-chrome-512x512.png',
  ENV_CONFIG.public.origin
)

const ThemedLabel = styled('span')({
  display: 'inline-block',
  minWidth: '5em',
  // userSelect: 'none',
})

export function FriendsLinkDesc() {
  return (
    <Box>
      <Typography component='h3' sx={{ fontWeight: 'bold', fontSize: '1.2em' }}>
        友链申请条件
      </Typography>
      <Typography
        component='ul'
        sx={{
          listStyle: 'disc',
          py: 1,
          pl: 2,
        }}
      >
        <Typography component='li'>必须 https</Typography>
        <Typography component='li'>必须为原创内容 (至少大部分是)</Typography>
        <Typography component='li'>内容不能反社会, 最好积极乐观</Typography>
        <Typography component='li'>
          <AnchorProvider>
            {(anchorEl, setAnchorEl) => (
              <>
                需要先
                <Button
                  size='small'
                  title={`${anchorEl ? '收起' : '展开'}本站友链信息`}
                  sx={{
                    fontWeight: 'bold',
                  }}
                  onClick={(e) => {
                    setAnchorEl((prev) => (prev ? null : e.currentTarget))
                  }}
                >
                  添加本站为友链
                </Button>{' '}
                (或者你很牛哔)
                <Collapse in={!!anchorEl} timeout='auto'>
                  <Typography
                    component='ul'
                    sx={{
                      listStyle: 'disc',
                      py: 1,
                      pl: 2,
                    }}
                  >
                    <Typography component='li'>
                      <ThemedLabel>站点名称: </ThemedLabel>
                      {ENV_CONFIG.manifest.name}
                    </Typography>
                    <Typography component='li'>
                      <ThemedLabel>站点描述: </ThemedLabel>
                      {ENV_CONFIG.manifest.description}
                    </Typography>
                    <Typography component='li'>
                      <ThemedLabel>站点 url: </ThemedLabel>
                      {ENV_CONFIG.public.origin}
                    </Typography>
                    <Typography component='li'>
                      <ThemedLabel>站点 logo: </ThemedLabel>
                      {logo.href}
                    </Typography>
                  </Typography>
                </Collapse>
              </>
            )}
          </AnchorProvider>
        </Typography>
      </Typography>
      <Button
        variant='outlined'
        onClick={cat(async () => {
          await editFriendsLink()
          toast.success(
            '请等待管理员审核; 如果不通过, 将于 3 天内邮件通知你 (如果你留了邮箱的话)',
            {
              duration: 5000,
            }
          )
        })}
      >
        立即申请
      </Button>
    </Box>
  )
}

export function FriendsLinkSection({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) {
  return (
    <Box>
      <Typography component='h3' sx={{ fontWeight: 'bold', fontSize: '1.2em' }}>
        我的友链
      </Typography>
      <Box
        sx={{
          py: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
