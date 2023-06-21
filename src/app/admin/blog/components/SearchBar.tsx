'use client'

import { getBlogs, getTags } from './server'

import { SA } from '@/errors/utils'
import { useLoading } from '@/hooks/useLoading'

import useSWR from 'swr'
import { Controller, useForm } from 'react-hook-form'
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { toast } from 'react-hot-toast'
import { useState } from 'react'
import { AddOutlined, SearchOutlined } from '@mui/icons-material'

interface SearchProps {
  /**
   * 模糊搜索
   */
  title: string
  /**
   * tag.hash[]
   */
  tags: string[]
}

type Blogs = NonNullable<Awaited<ReturnType<typeof getBlogs>>['data']>

export function useBlogEditorSearchBar() {
  const {
    data: allTags = [],
    error: fetchAllTagsError,
    isValidating: fetchALlTagsIsValidating,
  } = useSWR('getTags', () => getTags({}).then(SA.decode))
  const { handleSubmit, control } = useForm<SearchProps>({
    defaultValues: {
      title: '',
      tags: [],
    },
  })
  const { loading, withLoading } = useLoading()
  const [blogs, setBlogs] = useState<Blogs>([])

  const elem = (
    <>
      <form
        onSubmit={handleSubmit(
          withLoading(async (e) => {
            await getBlogs({
              title: {
                contains: e.title,
              },
              tags: {
                some: {
                  OR: e.tags.map((t) => ({
                    hash: t,
                  })),
                },
              },
            })
              .then(SA.decode)
              .then((res) => {
                setBlogs(res)
              })
              .catch((err) => {
                toast.error(err.message)
              })
          }, 300)
        )}
      >
        <Stack
          spacing={1}
          direction='row'
          sx={{
            p: 2,
            borderRadius: 1,
            marginBottom: 2,
            background: (theme) => theme.palette.background.paper,
          }}
        >
          <Controller
            name='title'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                size='small'
                label='标题'
                helperText={error?.message ?? ' '}
                error={!!error}
              />
            )}
            rules={{
              maxLength: {
                value: 100,
                message: '最多 100 个字',
              },
            }}
          />
          <Controller
            name='tags'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl size='small' sx={{ minWidth: 200, maxWidth: 500 }}>
                <InputLabel>标签</InputLabel>
                <Select
                  {...field}
                  multiple
                  error={!!error || fetchAllTagsError}
                  input={<OutlinedInput label='标签' />}
                  renderValue={(hashes) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {hashes.map((hash) => (
                        <Chip
                          size='small'
                          key={hash}
                          label={
                            allTags.find((t) => t.hash === hash)?.name ?? hash
                          }
                        />
                      ))}
                    </Box>
                  )}
                >
                  {allTags.map((tag) => (
                    <MenuItem key={tag.hash} value={tag.hash}>
                      {tag.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {[
                    error?.message,
                    fetchALlTagsIsValidating && '加载中...',
                    fetchAllTagsError &&
                      `加载出错: ${fetchAllTagsError.message}`,
                  ]
                    .filter(Boolean)
                    .join(' + ')}
                  &nbsp;
                </FormHelperText>
              </FormControl>
            )}
          />
          <LoadingButton
            loading={loading}
            variant='contained'
            type='submit'
            sx={{
              height: '40px',
            }}
            startIcon={<SearchOutlined />}
          >
            搜索
          </LoadingButton>
          <Button
            variant='outlined'
            sx={{
              height: '40px',
            }}
            startIcon={<AddOutlined />}
          >
            新建
          </Button>
        </Stack>
      </form>
    </>
  )

  return {
    elem,
    data: blogs,
  }
}
