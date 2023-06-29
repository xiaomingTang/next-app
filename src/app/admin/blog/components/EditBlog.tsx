'use client'

import { createNewBlog, getBlog, getTags, saveBlog } from './server'

import { SA } from '@/errors/utils'
import { useLoading } from '@/hooks/useLoading'
import { cat } from '@/errors/catchAndToast'
import { formatTime, friendlyFormatTime } from '@/utils/formatTime'

import { Visibility } from '@mui/icons-material'
import { forwardRef, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Slide from '@mui/material/Slide'
import useSWR from 'swr'
import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

import type { Blog, Tag } from '@prisma/client'
import type { TransitionProps } from '@mui/material/transitions'

function RawTransition(
  props: TransitionProps & {
    children: React.ReactElement
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
}

const Transition = forwardRef(RawTransition)

type BlogWithTags = NonNullable<Awaited<ReturnType<typeof getBlog>>['data']>

export function useEditBlog() {
  const [open, setOpen] = useState(false)
  const [blog, setBlog] = useState<BlogWithTags | null>(null)
  const { loading: saveLoading, withLoading: withSaveLoading } = useLoading()
  const {
    data: allTags = [],
    error: fetchAllTagsError,
    isValidating: fetchALlTagsIsValidating,
  } = useSWR('getTags', () => getTags({}).then(SA.decode))

  const handleClose = () => {
    setOpen(false)
  }

  const elem = (
    <>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar variant='dense'>
            <IconButton
              edge='start'
              color='inherit'
              onClick={handleClose}
              aria-label='close'
            >
              <CloseIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              {blog && (
                <Tooltip
                  title={formatTime(blog.updatedAt)}
                  placement='bottom-start'
                >
                  <Typography component='span'>
                    上次编辑于 {friendlyFormatTime(blog.updatedAt)}
                  </Typography>
                </Tooltip>
              )}
            </Box>
            <LoadingButton
              loading={saveLoading}
              color='inherit'
              onClick={withSaveLoading(
                cat(async () => {
                  if (!blog) {
                    throw new Error('文章不存在')
                  }
                  await saveBlog(blog.hash, {
                    ...blog,
                    tags: {
                      set: blog.tags.map((t) => ({
                        hash: t.hash,
                      })),
                    },
                  }).then(SA.decode)
                  handleClose()
                })
              )}
            >
              保存
            </LoadingButton>
            <IconButton sx={{ color: 'inherit' }} edge='end'>
              <Visibility />
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
              setBlog((prev) => {
                if (!prev) {
                  return null
                }
                return {
                  ...prev,
                  title: e.target.value,
                }
              })
            }}
          />
          <FormControl
            size='small'
            sx={{ minWidth: 200, maxWidth: 500, marginTop: 2 }}
          >
            <InputLabel>标签</InputLabel>
            <Select
              multiple
              error={fetchAllTagsError}
              value={(blog?.tags ?? []).map((t) => t.hash)}
              input={<OutlinedInput label='标签' />}
              onChange={(e) => {
                setBlog((prev) => {
                  if (!prev) {
                    return null
                  }
                  const newVal = e.target.value
                  const newTagHashes =
                    typeof newVal === 'string' ? [newVal] : newVal
                  return {
                    ...prev,
                    tags: allTags.filter((tag) =>
                      newTagHashes.includes(tag.hash)
                    ),
                  }
                })
              }}
              renderValue={(tags) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {tags.map((hash) => (
                    <Chip
                      size='small'
                      key={hash}
                      label={allTags.find((t) => t.hash === hash)?.name ?? hash}
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
                fetchALlTagsIsValidating && '加载中...',
                fetchAllTagsError && `加载出错: ${fetchAllTagsError.message}`,
              ]
                .filter(Boolean)
                .join(' + ')}
              &nbsp;
            </FormHelperText>
          </FormControl>
          <TextField
            label='内容'
            size='small'
            value={blog?.content ?? ''}
            onChange={(e) => {
              setBlog((prev) => {
                if (!prev) {
                  return null
                }
                return {
                  ...prev,
                  content: e.target.value,
                }
              })
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
        </Box>
      </Dialog>
    </>
  )

  // todo: 保存之后才能 return
  const edit = async (blogHash = '') => {
    const res = blogHash
      ? await getBlog({
          hash: blogHash,
        }).then(SA.decode)
      : await createNewBlog().then(SA.decode)
    setBlog(res)
    setOpen(true)
  }

  return {
    elem,
    edit,
  }
}
