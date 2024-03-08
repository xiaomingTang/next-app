import { usePeer } from '../store/usePeer'
import { allMessageTypes } from '../constants'

import { cat } from '@/errors/catchAndToast'
import { toError } from '@/errors/utils'
import { useGlobalFileCatcherHandler } from '@/layout/components/useGlobalFileCatcherHandler'
import { restrictPick } from '@/utils/array'
import { file2DataURL } from '@/app/(default-layout)/color/utils'

import { Button, Stack, TextField } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export function MessageEditor() {
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
          allMessageTypes,
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
