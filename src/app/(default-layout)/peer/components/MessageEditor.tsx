import { usePeer } from '../store/usePeer'
import { usePeerListener } from '../hooks/usePeerListener'
import { usePeerMessage } from '../store/useMessage'
import { isMessageIns } from '../constants'

import { cat } from '@/errors/catchAndToast'
import { toError } from '@/errors/utils'
import { useListen } from '@/hooks/useListen'

import { Button, Stack, TextField } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { nanoid } from 'nanoid'

import type { DataConnection, MediaConnection } from 'peerjs'

function onlyDataConnection(
  connection: DataConnection | MediaConnection | null
): DataConnection | null {
  if (!connection) {
    return connection
  }
  if (connection.type === 'data') {
    return connection as DataConnection
  }
  return null
}

export function MessageEditor() {
  const { peer } = usePeer()
  const { messages } = usePeerMessage()

  useListen(messages, () => {
    console.log(messages)
  })

  /**
   * @WARNING
   * 艹了, connection 需要区分 in / out;
   * peer.on('connection') 拿到的是对方的连接, 可以绑定 data 事件;
   * peer.connect() 返回的是我们自己的连接, 可以发送信息(如 .send);
   */
  usePeerListener(peer, 'connection', (connection) => {
    connection.on('data', (data) => {
      if (isMessageIns(data)) {
        usePeerMessage.addMessage(connection.peer, data)
      }
    })
  })

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
