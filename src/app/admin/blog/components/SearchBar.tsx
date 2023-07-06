import { defaultEmptyBlog, useEditBlog } from './EditBlog'
import { getBlogs } from './server'

import { getTags } from '@/app/admin/tag/components/server'
import { SA } from '@/errors/utils'
import { useLoading } from '@/hooks/useLoading'
import { cat } from '@/errors/catchAndToast'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { useUser } from '@/user'

import useSWR from 'swr'
import { Controller, useForm } from 'react-hook-form'
import {
  Box,
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
import { toast } from 'react-hot-toast'
import { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { Role } from '@prisma/client'

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

export type Blogs = NonNullable<Awaited<ReturnType<typeof getBlogs>>['data']>

export function useBlogEditorSearchBar() {
  const { elem: editElem, edit } = useEditBlog()
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
  const { loading: searchLoading, withLoading: withSearchLoading } =
    useLoading()
  const [blogs, setBlogs] = useState<Blogs>([])
  const user = useUser()

  const onSubmit = useMemo(
    () =>
      handleSubmit(
        withSearchLoading(
          cat(async (e) => {
            await getBlogs(
              {
                title: {
                  contains: e.title,
                },
                // admin 用户展示所有人的博客
                // 普通用户仅展示自己的博客
                creatorId: user.role === Role.ADMIN ? undefined : user.id,
                tags:
                  e.tags.length === 0
                    ? {}
                    : {
                        some: {
                          OR: e.tags.map((t) => ({
                            hash: t,
                          })),
                        },
                      },
              },
              { withContent: true }
            )
              .then(SA.decode)
              .then((res) => {
                setBlogs(res)
                if (res.length === 0) {
                  toast.error('暂无数据')
                }
              })
          })
        )
      ),
    [handleSubmit, user.id, user.role, withSearchLoading]
  )

  useEffect(() => {
    onSubmit()
  }, [onSubmit])

  const elem = (
    <>
      {editElem}
      <form onSubmit={onSubmit}>
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
              await edit(defaultEmptyBlog)
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
    data: blogs,
    search: onSubmit,
  }
}
