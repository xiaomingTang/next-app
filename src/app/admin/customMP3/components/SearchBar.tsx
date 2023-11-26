'use client'

import { editMP3 } from './EditMP3'

import { getMP3s } from '../server'

import { SA } from '@/errors/utils'
import { useLoading } from '@/hooks/useLoading'
import { cat } from '@/errors/catchAndToast'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { obj } from '@/utils/tiny'

import { Controller, useForm } from 'react-hook-form'
import { Stack, TextField } from '@mui/material'
import { toast } from 'react-hot-toast'
import { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'

import type { CustomMP3 } from '@prisma/client'

interface SearchProps {
  hash: string
  /**
   * 模糊搜索
   */
  name: string
}

export function useMP3EditorSearchBar() {
  const { handleSubmit, control } = useForm<SearchProps>({
    defaultValues: {
      hash: '',
      name: '',
    },
  })
  const [searchLoading, withSearchLoading] = useLoading()
  const [mp3s, setMP3s] = useState<CustomMP3[]>([])

  const onSubmit = useMemo(
    () =>
      handleSubmit(
        withSearchLoading(
          cat(async (e) => {
            await getMP3s({
              ...obj(e.hash && { hash: e.hash }),
              ...obj(
                e.name && {
                  name: {
                    contains: e.name,
                  },
                }
              ),
            })
              .then(SA.decode)
              .then((res) => {
                setMP3s(res)
                if (res.length === 0) {
                  toast.error('暂无数据')
                }
              })
          })
        )
      ),
    [handleSubmit, withSearchLoading]
  )

  useEffect(() => {
    onSubmit()
  }, [onSubmit])

  const elem = (
    <>
      <form onSubmit={onSubmit}>
        <Stack
          useFlexGap
          flexWrap='wrap'
          spacing={1}
          direction='row'
          sx={{
            p: 2,
            borderRadius: 1,
            marginBottom: 2,
            background: 'background.paper',
          }}
        >
          <Controller
            name='name'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                size='small'
                label='歌名【支持模糊搜索】'
                helperText={error?.message ?? ' '}
                error={!!error}
                sx={{ minWidth: 200, maxWidth: 500 }}
              />
            )}
            rules={{
              maxLength: {
                value: 16,
                message: '最多 16 个字',
              },
            }}
          />
          <Controller
            name='hash'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                size='small'
                label='hash'
                helperText={error?.message ?? ' '}
                error={!!error}
                sx={{ minWidth: 200, maxWidth: 500 }}
              />
            )}
            rules={{
              maxLength: {
                value: 100,
                message: '最多 100 个字',
              },
            }}
          />
          <CustomLoadingButton
            loading={searchLoading}
            variant='contained'
            type='submit'
            sx={{
              height: '40px',
              whiteSpace: 'nowrap',
            }}
            startIcon={<SearchIcon />}
          >
            搜索
          </CustomLoadingButton>
          <CustomLoadingButton
            variant='outlined'
            sx={{
              height: '40px',
              whiteSpace: 'nowrap',
            }}
            startIcon={<AddIcon />}
            onClick={cat(async () => {
              await editMP3()
              await onSubmit()
            })}
          >
            新建
          </CustomLoadingButton>
        </Stack>
      </form>
    </>
  )

  return {
    elem,
    data: mp3s,
    search: onSubmit,
  }
}
