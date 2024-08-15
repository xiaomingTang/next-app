'use client'

import { BlogTypeMap, sortedBlogTypes } from '../constants'
import { MultiSelect } from '../TagsSelect'
import { saveBlog } from '../../server'

import { showIframe } from '@/utils/showIframe'
import { SA, toPlainError } from '@/errors/utils'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { cat } from '@/errors/catchAndToast'
import { formatTime, friendlyFormatTime } from '@/utils/transformer'
import { useLoading } from '@/hooks/useLoading'
import { SlideUpTransition } from '@/components/Transitions'
import { UploadTrigger } from '@/layout/CornerButtons/UploadTrigger'
import { useInjectHistory } from '@/hooks/useInjectHistory'
import { SvgLoading } from '@/svg'
import { getTags, saveTag } from '@ADMIN/tag/server'
import { SilentError } from '@/errors/SilentError'
import { isCtrlAnd, useKeyDown } from '@/hooks/useKey'
import { useRawPlatform } from '@/utils/device'
import { dark } from '@/utils/theme'

import { useRouter } from 'next/navigation'
import PreviewIcon from '@mui/icons-material/Preview'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import useSWR from 'swr'
import {
  alpha,
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
  useColorScheme,
} from '@mui/material'
import { isEqual, noop, pick } from 'lodash-es'
import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import { Controller, useForm } from 'react-hook-form'
import Editor from '@monaco-editor/react'
import { common } from '@mui/material/colors'

import type { PartialBlog } from './constants'
import type { BlogWithTags } from '../../server'

interface EditBlogModalProps {
  blog: PartialBlog
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

export const BlogEditor = NiceModal.create(({ blog }: EditBlogModalProps) => {
  const { mode } = useColorScheme()
  const isMobile = useRawPlatform() === 'mobile'
  const router = useRouter()
  const modal = useModal()
  useInjectHistory(modal.visible, () => {
    modal.reject(new SilentError('操作已取消'))
    void modal.hide()
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
      void modal.hide()
    })
  )

  useKeyDown((e) => {
    if (isCtrlAnd('s', e)) {
      e.preventDefault()
      void onSubmit()
    }
  })

  const header = (
    <AppBar>
      <Toolbar>
        <IconButton
          edge='start'
          aria-label='取消编辑'
          onClick={() => {
            modal.reject(new SilentError('操作已取消'))
            void modal.hide()
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
          color='inherit'
          title='保存 [快捷键 ctrl + s]'
          onClick={onSubmit}
        >
          保存
        </CustomLoadingButton>
        <IconButton
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
        <FormControl error={!!error} sx={{ minWidth: 200, maxWidth: 500 }}>
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
          sx={{ minWidth: 200, maxWidth: 500 }}
          error={!!fetchAllTagsError || !!error}
        >
          {isLoadingAllTags ? (
            <TextField label='标签列表加载中...' disabled />
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
      render={({ field, fieldState: { error } }) => {
        if (isMobile) {
          return (
            <TextField
              {...field}
              label='内容 (markdown 语法)'
              multiline
              minRows={8}
              maxRows={30}
              helperText={error?.message ?? ' '}
              error={!!error}
              inputProps={{
                style: {
                  overflow: 'auto',
                },
              }}
            />
          )
        }
        return (
          <Box
            component='fieldset'
            sx={{
              px: 1,
              pb: '8px',
              border: '1px solid',
              borderColor: alpha(common.black, 0.23),
              [dark()]: {
                borderColor: alpha(common.white, 0.23),
              },
            }}
          >
            <Box component='legend' sx={{ fontSize: '0.75rem' }}>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ px: '5px' }}
              >
                内容 (markdown 语法)
              </Typography>
            </Box>
            <FormHelperText error={!!error} sx={{ px: '5px' }}>
              {error?.message ?? ' '}
            </FormHelperText>
            <Editor
              {...field}
              height='70vh'
              theme={mode === 'dark' ? 'vs-dark' : 'light'}
              defaultLanguage='markdown'
              defaultValue={field.value}
              onChange={(value) => {
                field.onChange(value)
              }}
              options={{
                scrollBeyondLastLine: false,
                automaticLayout: true,
                scrollbar: {
                  alwaysConsumeMouseWheel: false,
                },
              }}
            />
          </Box>
        )
      }}
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
        modal.reject(new SilentError('操作已取消'))
        void modal.hide()
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
