import { usePeer } from '../store/usePeer'
import { usePeerMessage } from '../store/useMessage'

import { cat } from '@/errors/catchAndToast'
import { toError } from '@/errors/utils'
import { useListen } from '@/hooks/useListen'

import { Button, Stack, TextField } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { nanoid } from 'nanoid'

export function MessageEditor() {
  const { peer, activeConnectionInfo } = usePeer()
  const { messages } = usePeerMessage()

  usePeerMessage.useInit(peer)

  useListen(
    messages[activeConnectionInfo?.targetPeerId ?? ''],
    (messageList) => {
      console.log(messageList)
    }
  )

  const { handleSubmit, control } = useForm<{
    inputText: string
  }>({
    defaultValues: {
      inputText: '',
    },
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
              id: nanoid(12),
            })
          } catch (error) {
            toast.error(toError(error).message)
          }
        })
      ),
    [handleSubmit]
  )

  return (
    <Stack
      component='form'
      spacing={1}
      direction='row'
      sx={{
        alignItems: 'flex-end',
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
              <Button variant='outlined'>
                <AddIcon />
              </Button>
            )}
          </>
        )}
      />
    </Stack>
  )
}
