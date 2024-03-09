import { usePeer } from '../store/usePeer'
import { ALL_MESSAGE_TYPES } from '../constants'

import { cat } from '@/errors/catchAndToast'
import { toError } from '@/errors/utils'
import { useGlobalFileCatcherHandler } from '@/layout/components/useGlobalFileCatcherHandler'
import { restrictPick } from '@/utils/array'
import { file2DataURL } from '@/app/(default-layout)/color/utils'
import { AnchorProvider } from '@/components/AnchorProvider'
import { getUserVideo } from '@/utils/media/video'

import { Button, Menu, MenuItem, Stack, TextField } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import MicIcon from '@mui/icons-material/Mic'
import VideocamIcon from '@mui/icons-material/Videocam'

export function MessageEditor() {
  const { activeConnectionInfo } = usePeer()
  const { handleSubmit, control, setValue } = useForm<{
    inputText: string
  }>({
    defaultValues: {
      inputText: '',
    },
  })

  useGlobalFileCatcherHandler.useUpdateHandler(async (files) => {
    if (files.length === 0) {
      return
    }

    const promises = files.map(
      cat(async (f) => {
        const url = await file2DataURL(f)
        const type = restrictPick(
          f.type.split('/')[0] ?? '',
          ALL_MESSAGE_TYPES,
          'file'
        )
        if (!url) {
          throw new Error(`文件转 DataURL 失败: ${f.name}`)
        }
        return usePeer.send({
          type,
          value: url,
        })
      })
    )

    await Promise.allSettled(promises)
  })

  const onSubmit = useMemo(
    () =>
      handleSubmit(
        cat(async (e) => {
          const { inputText } = e
          if (!inputText) {
            return
          }
          const trimmedText = inputText.trim()
          if (!trimmedText) {
            toast.error('请输入一些内容')
            return
          }
          try {
            // @TODO: 最好能跟踪消息发送状态 (loading / success / error)
            usePeer.send({
              type: 'text',
              value: trimmedText,
            })
            setValue('inputText', '')
          } catch (error) {
            toast.error(toError(error).message)
          }
        })
      ),
    [handleSubmit, setValue]
  )

  return (
    <Stack
      component='form'
      spacing={1}
      direction='row'
      sx={{
        width: '100%',
      }}
      onSubmit={onSubmit}
    >
      <Controller
        name='inputText'
        control={control}
        render={({ field }) => (
          <>
            <TextField
              label='请输入'
              placeholder='"ctrl + Enter" 快捷发送'
              multiline
              maxRows={4}
              {...field}
              sx={{
                flex: '1 1 auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  onSubmit()
                }
              }}
            />
            {!!field.value && (
              <Button type='submit' variant='contained'>
                发送
              </Button>
            )}
            {!field.value && (
              <AnchorProvider>
                {(anchorEl, setAnchorEl) => (
                  <>
                    <Button
                      variant='outlined'
                      aria-label='选择发送图片、视频或文件'
                      onClick={(e) => {
                        setAnchorEl((prev) => {
                          if (!prev) {
                            return e.currentTarget
                          }
                          return null
                        })
                      }}
                    >
                      <MoreVertIcon />
                    </Button>
                    <Menu
                      autoFocus
                      open={!!anchorEl}
                      anchorEl={anchorEl}
                      onClose={() => setAnchorEl(null)}
                      transformOrigin={{
                        horizontal: 'right',
                        vertical: 'bottom',
                      }}
                      anchorOrigin={{
                        horizontal: 'right',
                        vertical: 'top',
                      }}
                    >
                      <MenuItem
                        key='语音通话'
                        disabled
                        onClick={() => {
                          // usePeer.callPeer()
                          setAnchorEl(null)
                        }}
                      >
                        <MicIcon sx={{ mr: 1 }} /> 语音通话 (开发中)
                      </MenuItem>
                      <MenuItem
                        key='视频通话'
                        onClick={cat(async () => {
                          setAnchorEl(null)
                          const targetPeerId =
                            activeConnectionInfo?.targetPeerId
                          if (!targetPeerId) {
                            toast.error('没有可用的连接')
                            return
                          }
                          const stream = await getUserVideo({
                            video: {
                              facingMode: 'user',
                            },
                            audio: {
                              echoCancellation: true,
                            },
                          })
                          usePeer.callPeer(targetPeerId, stream)
                        })}
                      >
                        <VideocamIcon sx={{ mr: 1 }} /> 视频通话
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </AnchorProvider>
            )}
          </>
        )}
      />
    </Stack>
  )
}
