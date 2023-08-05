'use client'

import { BlogTypeMap, sortedBlogTypes } from './constants'
import { editMarkdown } from './editMarkdown'
import { MultiSelect } from './TagsSelect'

import { saveBlog } from '../server'

import { SA, toPlainError } from '@/errors/utils'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { cat } from '@/errors/catchAndToast'
import { formatTime, friendlyFormatTime } from '@/utils/formatTime'
import { useLoading } from '@/hooks/useLoading'
import { getTags, saveTag } from '@/app/admin/tag/server'
import { SlideUpTransition } from '@/components/SlideUpTransition'
import { UploadTrigger } from '@/layout/CornerButtons/UploadTrigger'
import { useModalPushState } from '@/hooks/useModalPushState'

import { useRouter } from 'next/navigation'
import VisibilityIcon from '@mui/icons-material/Visibility'
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
import { pick } from 'lodash-es'
import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import { Controller, useForm } from 'react-hook-form'

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

const BlogEditor = NiceModal.create(({ blog }: EditBlogModalProps) => {
  const router = useRouter()
  const modal = useModal()
  useModalPushState(modal, async () => {
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
  const defaultFormProps: FormProps = {
    ...pick(blog, 'hash', 'title', 'description', 'content', 'type'),
    tags: blog.tags.map((t) => t.hash),
  }
  const {
    handleSubmit,
    control,
    setValue: setFormValue,
  } = useForm<FormProps>({
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
            <Tooltip title={formatTime(blog.updatedAt)}>
              <Typography component='span'>
                上次编辑于 {friendlyFormatTime(blog.updatedAt)}
              </Typography>
            </Tooltip>
          ) : (
            <Typography component='span'>新建</Typography>
          )}
        </Box>
        <UploadTrigger />
        <CustomLoadingButton size='small' color='inherit' onClick={onSubmit}>
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
            setFormValue('content', content)
          })}
        >
          <VisibilityIcon />
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
              defaultSelectedList={field.value}
              selectList={allTags.map((t) => ({
                label: t.name,
                value: t.hash,
              }))}
              onNoMatch={withAddTagLoading(async (s) => {
                if (!s) {
                  return
                }
                await saveTag({
                  hash: '',
                  name: s,
                  description: s,
                }).then(SA.decode)
                await mutateAllTags()
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
      // 编辑(hash 非空)或有内容时, 禁用 esc close
      disableEscapeKeyDown={!!(blog.hash || blog.content || blog.description)}
      TransitionComponent={SlideUpTransition}
      {...muiDialogV5(modal)}
      onClose={() => {
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
