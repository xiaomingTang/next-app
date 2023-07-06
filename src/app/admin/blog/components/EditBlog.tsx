import { saveBlog } from './server'
import { BlogTypeMap, sortedBlogTypes } from './constants'
import { editMarkdown } from './editMarkdown'
import { MultiSelect } from './TagsSelect'

import { SA } from '@/errors/utils'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { cat } from '@/errors/catchAndToast'
import { formatTime, friendlyFormatTime } from '@/utils/formatTime'
import { useLoading } from '@/hooks/useLoading'
import { getTags, saveTag } from '@/app/admin/tag/components/server'

import VisibilityIcon from '@mui/icons-material/Visibility'
import CloseIcon from '@mui/icons-material/Close'
import { forwardRef, useRef, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Slide from '@mui/material/Slide'
import useSWR from 'swr'
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { noop } from 'lodash-es'
import { BlogType } from '@prisma/client'

import type { BlogWithTags } from './server'
import type { TransitionProps } from '@mui/material/transitions'
import type { PickAndPartial } from '@/utils/type'

interface EditBlogPromise {
  resolve: (blog: BlogWithTags) => void
  reject: (reason: Error) => void
}

const defaultPromise: EditBlogPromise = {
  resolve: noop,
  reject: noop,
}

type PartialBlog = PickAndPartial<
  BlogWithTags,
  'creator' | 'tags' | 'hash' | 'createdAt' | 'updatedAt'
>

export const defaultEmptyBlog: PartialBlog = {
  title: '',
  content: '',
  description: '',
  type: BlogType.PRIVATE_UNPUBLISHED,
}

function RawTransition(
  props: TransitionProps & {
    children: React.ReactElement
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
}

const Transition = forwardRef(RawTransition)

export function useEditBlog() {
  const [open, setOpen] = useState(false)
  const [blog, setBlog] = useState<PartialBlog>(defaultEmptyBlog)
  const {
    data: allTags = [],
    mutate: mutateAllTags,
    error: fetchAllTagsError,
  } = useSWR('getTags', () => getTags({}).then(SA.decode))
  const promiseRef = useRef(defaultPromise)
  const { loading: addTagLoading, withLoading: withAddTagLoading } =
    useLoading()

  const elem = (
    <>
      <Dialog
        fullScreen
        // 编辑(hash 非空)或有内容时, 禁用 esc close
        disableEscapeKeyDown={!!(blog.hash || blog.content || blog.description)}
        open={open}
        onClose={() => {
          promiseRef.current.reject(new Error('取消编辑'))
        }}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar variant='dense'>
            <IconButton
              edge='start'
              aria-label='取消编辑'
              onClick={() => {
                promiseRef.current.reject(new Error('取消编辑'))
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              {blog.hash && blog.updatedAt ? (
                <Tooltip title={formatTime(blog.updatedAt)}>
                  <Typography component='span'>
                    上次编辑于 {friendlyFormatTime(blog.updatedAt)}
                  </Typography>
                </Tooltip>
              ) : (
                <Typography component='span'>新建</Typography>
              )}
            </Box>
            <CustomLoadingButton
              size='small'
              color='inherit'
              onClick={cat(async () => {
                const res = await saveBlog({
                  ...blog,
                  tags: (blog.tags ?? []).map((t) => t.hash),
                }).then(SA.decode)
                promiseRef.current.resolve(res)
              })}
            >
              保存
            </CustomLoadingButton>
            <IconButton
              size='small'
              edge='end'
              aria-label='预览/可视化编辑'
              onClick={cat(async () => {
                const content = await editMarkdown({
                  name: blog?.title,
                  content: {
                    text: blog?.content,
                  },
                })
                setBlog({
                  ...blog,
                  content,
                })
              })}
            >
              <VisibilityIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            p: 2,
            width: '100%',
            flex: 1,
          }}
        >
          <TextField
            label='标题'
            size='small'
            sx={{ display: 'flex' }}
            value={blog?.title ?? ''}
            onChange={(e) => {
              setBlog((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }}
          />
          <FormControl
            size='small'
            sx={{ minWidth: 200, maxWidth: 500, marginTop: 2, marginRight: 2 }}
          >
            <InputLabel>状态</InputLabel>
            <Select
              value={blog?.type}
              input={<OutlinedInput label='状态' />}
              onChange={(e) => {
                setBlog((prev) => ({
                  ...prev,
                  type: e.target.value as BlogType,
                }))
              }}
              renderValue={(type) => (
                <>{!type ? '-' : BlogTypeMap[type].name}</>
              )}
            >
              {sortedBlogTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {BlogTypeMap[type as BlogType].name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            size='small'
            sx={{ minWidth: 200, maxWidth: 500, marginTop: 2, marginRight: 2 }}
            error={!!fetchAllTagsError}
          >
            <MultiSelect
              label={`标签${addTagLoading ? ' 添加中...' : ''}`}
              value={blog.tags?.map((t) => t.hash)}
              selectList={allTags.map((t) => ({
                label: t.name,
                value: t.hash,
              }))}
              onChange={(selected) => {
                setBlog((prev) => ({
                  ...prev,
                  tags: allTags.filter((tag) => selected.includes(tag.hash)),
                }))
              }}
              onNoMatch={withAddTagLoading(async (s) => {
                if (!s) {
                  return
                }
                const newTag = await saveTag({
                  hash: '',
                  name: s,
                  description: s,
                }).then(SA.decode)
                const newAllTags = (await mutateAllTags()) ?? allTags
                setBlog((prev) => {
                  const prevTagHashes = (prev.tags ?? []).map((t) => t.hash)
                  const nextTagHashes = [...prevTagHashes, newTag.hash]
                  return {
                    ...prev,
                    tags: newAllTags.filter((tag) =>
                      nextTagHashes.includes(tag.hash)
                    ),
                  }
                })
              })}
            />
          </FormControl>

          <TextField
            label='简介'
            size='small'
            value={blog?.description ?? ''}
            onChange={(e) => {
              setBlog((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }}
            multiline
            minRows={4}
            maxRows={30}
            sx={{
              marginTop: 2,
              display: 'flex',
            }}
            inputProps={{
              style: {
                overflow: 'auto',
              },
            }}
          />
          <TextField
            label='内容 (markdown 语法)'
            size='small'
            value={blog?.content ?? ''}
            onChange={(e) => {
              setBlog((prev) => ({
                ...prev,
                content: e.target.value,
              }))
            }}
            multiline
            minRows={8}
            maxRows={30}
            sx={{
              marginTop: 2,
              display: 'flex',
            }}
            inputProps={{
              style: {
                overflow: 'auto',
              },
            }}
          />
        </Box>
      </Dialog>
    </>
  )

  const edit = async (input: PartialBlog): Promise<BlogWithTags> => {
    setBlog(input)
    setOpen(true)
    return new Promise((resolve, reject) => {
      promiseRef.current = {
        resolve: (_blog) => {
          resolve(_blog)
          setOpen(false)
        },
        reject: (_reason) => {
          reject(_reason)
          setOpen(false)
        },
      }
    })
  }

  return {
    elem,
    edit,
  }
}
