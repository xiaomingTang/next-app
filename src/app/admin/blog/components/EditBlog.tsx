'use client'

import { BlogTypeMap, sortedBlogTypes } from './constants'
import { MultiSelect } from './TagsSelect'

import { saveBlog } from '../server'

import { showIframe } from '@/utils/showIframe'
import { SA, toPlainError } from '@/errors/utils'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { cat } from '@/errors/catchAndToast'
import { formatTime, friendlyFormatTime } from '@/utils/formatTime'
import { useLoading } from '@/hooks/useLoading'
import { SlideUpTransition } from '@/components/SlideUpTransition'
import { UploadTrigger } from '@/layout/CornerButtons/UploadTrigger'
import { useInjectHistory } from '@/hooks/useInjectHistory'
import { SvgLoading } from '@/svg'
import { getTags, saveTag } from '@ADMIN/tag/server'

import { useRouter } from 'next/navigation'
import PreviewIcon from '@mui/icons-material/Preview'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import useSWR from 'swr'
import {
  Box,
  DialogContent,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { isEqual, noop, pick } from 'lodash-es'
import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import { Controller, useForm } from 'react-hook-form'
import { useKeyPressEvent } from 'react-use'

import type { BlogWithTags } from '../server'
import type { PickAndPartial } from '@/utils/type'

type PartialBlog = PickAndPartial<
  BlogWithTags,
  'creator' | 'createdAt' | 'updatedAt'
>

interface EditBlogModalProps {
  blog: PartialBlog
}

export const defaultEmptyBlog: PartialBlog = {
  hash: '',
  title: '',
  content: '',
  description: '',
  type: 'UNPUBLISHED',
  tags: [],
}

type FormProps = Pick<
  BlogWithTags,
  'hash' | 'title' | 'description' | 'content' | 'type'
> & {
  tags: string[]
}

function hasChanged(blog: PartialBlog, formValues: FormProps) {
  return (
    blog.content.trim() !== formValues.content.trim() ||
    blog.description.trim() !== formValues.description.trim() ||
    blog.title.trim() !== formValues.title.trim() ||
    !isEqual(
      blog.tags.map((t) => t.hash),
      formValues.tags
    )
  )
}

const BlogEditor = NiceModal.create(({ blog }: EditBlogModalProps) => {
  const router = useRouter()
  const modal = useModal()
  useInjectHistory(modal.visible, () => {
    modal.reject(new Error('操作已取消'))
    modal.hide()
  })
  const {
    data: allTags = [],
    mutate: mutateAllTags,
    error: fetchAllTagsError,
    isLoading: isLoadingAllTags,
  } = useSWR('getTags', () => getTags({}).then(SA.decode))
  const [addTagLoading, withAddTagLoading] = useLoading()
  const [previewLoading, withPreviewLoading] = useLoading()
  const defaultFormProps: FormProps = {
    ...pick(blog, 'hash', 'title', 'description', 'content', 'type'),
    tags: blog.tags.map((t) => t.hash),
  }
  const { handleSubmit, control, getValues, setValue } = useForm<FormProps>({
    defaultValues: defaultFormProps,
  })

  const onSubmit = handleSubmit(
    cat(async (e) => {
      const res = await saveBlog(e).then(SA.decode)
      router.refresh()
      modal.resolve(res)
      modal.hide()
    })
  )

  useKeyPressEvent(
    (e) => e.ctrlKey && e.key.toLowerCase() === 's',
    (e) => {
      e.preventDefault()
      onSubmit()
    }
  )

  const header = (
    <AppBar sx={{ position: 'relative' }}>
      <Toolbar variant='dense'>
        <IconButton
          edge='start'
          aria-label='取消编辑'
          onClick={() => {
            modal.reject(new Error('操作已取消'))
            modal.hide()
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          {blog.hash && blog.updatedAt ? (
            <Tooltip title={`上次编辑于 ${formatTime(blog.updatedAt)}`}>
              <Typography
                component='span'
                aria-label={`上次编辑于 ${friendlyFormatTime(blog.updatedAt)}`}
              >
                上次编辑于 {friendlyFormatTime(blog.updatedAt)}
              </Typography>
            </Tooltip>
          ) : (
            <Typography component='span'>新建</Typography>
          )}
        </Box>
        <UploadTrigger />
        <CustomLoadingButton
          size='small'
          color='inherit'
          title='保存 [快捷键 ctrl + s]'
          onClick={onSubmit}
        >
          保存
        </CustomLoadingButton>
        <IconButton
          size='small'
          edge='end'
          aria-label='预览'
          onClick={cat(
            withPreviewLoading(async () => {
              // @TODO: 数据库需要新增一个博客预览表 (缓存表)
              await saveBlog(getValues()).then(SA.decode)
              const url = new URL(window.location.href)
              url.pathname = `/blog/${blog.hash}/draft`
              showIframe({ url, title: '博客预览' }).catch(noop)
            })
          )}
        >
          {previewLoading ? (
            <SvgLoading className='animate-spin' />
          ) : (
            <PreviewIcon />
          )}
        </IconButton>
      </Toolbar>
    </AppBar>
  )

  const titleElem = (
    <Controller
      name='title'
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          label='标题'
          size='small'
          helperText={error?.message ?? ' '}
          error={!!error}
        />
      )}
      rules={{
        required: {
          value: true,
          message: '必填项',
        },
        minLength: {
          value: 2,
          message: '最少 2 个字',
        },
        maxLength: {
          value: 100,
          message: '最多 100 个字',
        },
      }}
    />
  )

  const typeElem = (
    <Controller
      name='type'
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl
          size='small'
          error={!!error}
          sx={{ minWidth: 200, maxWidth: 500 }}
        >
          <InputLabel>状态</InputLabel>
          <Select
            {...field}
            input={<OutlinedInput label='状态' />}
            renderValue={(type) => <>{BlogTypeMap[type].name}</>}
          >
            {sortedBlogTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {BlogTypeMap[type].name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{error?.message ?? ' '}</FormHelperText>
        </FormControl>
      )}
    />
  )

  const tagsElem = (
    <Controller
      name='tags'
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl
          size='small'
          sx={{ minWidth: 200, maxWidth: 500 }}
          error={!!fetchAllTagsError || !!error}
        >
          {isLoadingAllTags ? (
            <TextField label='标签列表加载中...' disabled size='small' />
          ) : (
            <MultiSelect
              {...field}
              label={`标签${addTagLoading ? ' 添加中...' : ''}`}
              selectedList={field.value}
              selectList={allTags.map((t) => ({
                label: t.name,
                value: t.hash,
              }))}
              onNoMatch={withAddTagLoading(async (s) => {
                if (!s) {
                  return
                }
                const tag = await saveTag({
                  hash: '',
                  name: s,
                  description: s,
                }).then(SA.decode)
                await mutateAllTags()
                setValue('tags', [...field.value, tag.hash])
              })}
            />
          )}

          <FormHelperText>
            {[
              error?.message,
              fetchAllTagsError && toPlainError(fetchAllTagsError).message,
            ]
              .filter(Boolean)
              .join(' + ')}
            &nbsp;
          </FormHelperText>
        </FormControl>
      )}
    />
  )

  const descElem = (
    <Controller
      name='description'
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          label='简介'
          size='small'
          helperText={error?.message ?? ' '}
          error={!!error}
          multiline
          minRows={4}
          maxRows={30}
          inputProps={{
            style: {
              overflow: 'auto',
            },
          }}
        />
      )}
      rules={{
        required: {
          value: true,
          message: '必填项',
        },
        minLength: {
          value: 2,
          message: '最少 2 个字',
        },
        maxLength: {
          value: 200,
          message: '最多 200 个字',
        },
      }}
    />
  )

  const contentElem = (
    <Controller
      name='content'
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          label='内容 (markdown 语法)'
          multiline
          minRows={8}
          maxRows={30}
          size='small'
          helperText={error?.message ?? ' '}
          error={!!error}
          inputProps={{
            style: {
              overflow: 'auto',
            },
          }}
        />
      )}
      rules={{
        required: {
          value: true,
          message: '必填项',
        },
        minLength: {
          value: 2,
          message: '最少 2 个字',
        },
        maxLength: {
          value: 20000,
          message: '最多 20000 个字',
        },
      }}
    />
  )

  return (
    <Dialog
      fullWidth
      fullScreen
      TransitionComponent={SlideUpTransition}
      {...muiDialogV5(modal)}
      onClose={(_, reason) => {
        // 内容发生改变时, 禁用 esc close
        if (reason === 'escapeKeyDown' && hasChanged(blog, getValues())) {
          return
        }
        modal.reject(new Error('操作已取消'))
        modal.hide()
      }}
    >
      {header}
      <DialogContent>
        <Stack component={'form'} direction='column' spacing={1}>
          {titleElem}
          <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
            {typeElem}
            {tagsElem}
          </Stack>
          {descElem}
          {contentElem}
        </Stack>
      </DialogContent>
    </Dialog>
  )
})

export async function editBlog(input: PartialBlog): Promise<BlogWithTags> {
  return NiceModal.show(BlogEditor, {
    blog: input,
  })
}
