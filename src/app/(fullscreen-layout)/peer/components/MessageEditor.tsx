import { usePeer } from '../store/usePeer'
import { ALL_MESSAGE_TYPES } from '../constants'

import { cat } from '@/errors/catchAndToast'
import { toError } from '@/errors/utils'
import { useGlobalFileCatcherHandler } from '@/layout/components/useGlobalFileCatcherHandler'
import { restrictPick } from '@/utils/array'
import { AnchorProvider } from '@/components/AnchorProvider'
import { getUserMedia } from '@/utils/media'

import { Button, Menu, MenuItem, Stack, TextField } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import MicIcon from '@mui/icons-material/Mic'
import VideocamIcon from '@mui/icons-material/Videocam'

import type { BaseMessageIns, FileLikeMessageIns } from '../type'

const MAX_PREVIEW_ABLE_SIZE = 100 * 1024 * 1024
const MAX_FILE_SIZE = 100 * 1024 * 1024

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
        const type = restrictPick(
          f.type.split('/')[0] ?? '',
          ALL_MESSAGE_TYPES,
          'file'
        )
        if (type === 'text') {
          throw new Error('不支持的文件类型')
        }
        // TODO: 超大文件支持流式收发下载 (当前是 DataURL, 总是静默失败)
        if (f.size > MAX_FILE_SIZE) {
          throw new Error('暂不支持发送大于 100M 的文件')
        }
        const fileMessage: Omit<FileLikeMessageIns, keyof BaseMessageIns> = {
          type: f.size > MAX_PREVIEW_ABLE_SIZE ? 'file' : type,
          value: f,
          contentType: f.type,
          size: f.size,
          name: f.name,
        }
        return usePeer.send(fileMessage)
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
                          const stream = await getUserMedia({
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
