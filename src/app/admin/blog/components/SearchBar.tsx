import { editBlog } from './EditBlog'
import { defaultEmptyBlog } from './BlogEditor/constants'

import { getBlogs } from '../server'

import { getTags } from '@ADMIN/tag/server'
import { SA } from '@/errors/utils'
import { useLoading } from '@/hooks/useLoading'
import { cat } from '@/errors/catchAndToast'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { useUser } from '@/user'
import { obj } from '@/utils/tiny'

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
import { sleepMs } from '@zimi/utils'

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
  const [searchLoading, withSearchLoading] = useLoading()
  const [blogs, setBlogs] = useState<Blogs>([])
  const user = useUser()

  const onSubmit = useMemo(
    () =>
      handleSubmit(
        withSearchLoading(
          cat(async (e) => {
            await sleepMs(50)
            // 不知道为什么，这儿 getBlogs 在一些场景下总是不执行，
            // 如：在后台博客列表页 -> 退出登录 -> 刷新页面 -> 重新登录，此时 getBlogs 不执行。
            // 再如：新增博客执行完毕后的 getBlogs 也不执行。
            // （客户端已经执行了，但是服务端没有收到请求，且 Promise 永远不 resolve/reject。）
            // 加了一个 sleep 之后就好了，暂未找到原因。
            // **猜测**是路由变化之后立即执行 server actions，
            // 客户端生成的函数索引 id 基于的是前一个路由，与服务端对不上；
            // maybe 路由变化是异步的，sleep 之后，路由变化已完成，函数索引 id 就对上了。
            await getBlogs({
              title: {
                contains: e.title,
              },
              // admin 用户展示所有人的博客
              // 普通用户仅展示自己的博客
              creatorId: user.role === 'ADMIN' ? undefined : user.id,
              tags: obj(
                e.tags.length > 0 && {
                  some: {
                    OR: e.tags.map((t) => ({
                      hash: t,
                    })),
                  },
                }
              ),
            })
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
    void onSubmit()
  }, [onSubmit])

  const elem = (
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
          color: 'var(--custom-fg)',
        }}
      >
        <Controller
          name='title'
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
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
            <FormControl
              sx={{ minWidth: 200, maxWidth: 500 }}
              error={!!error || fetchAllTagsError}
            >
              <InputLabel>标签</InputLabel>
              <Select
                {...field}
                multiple
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
                  fetchAllTagsError && `加载出错: ${fetchAllTagsError.message}`,
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
            await editBlog(defaultEmptyBlog)
            await onSubmit()
          })}
        >
          新建
        </CustomLoadingButton>
      </Stack>
    </form>
  )

  return {
    elem,
    data: blogs,
    search: onSubmit,
  }
}
