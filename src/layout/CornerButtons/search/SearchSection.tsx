'use client'

import { cat } from '@/errors/catchAndToast'
import { searchBlog } from '@ADMIN/blog/server'
import { SA } from '@/errors/utils'
import { useLoading } from '@/hooks/useLoading'
import SvgGoogle from '@/svg/assets/google.svg?icon'
import SvgLoading from '@/svg/assets/loading.svg?icon'
import { BlogList } from '@D/blog/components/BlogList'
import { obj } from '@/utils/tiny'
import { useInjectHistory } from '@/hooks/useInjectHistory'
import { useListen } from '@/hooks/useListen'
import { useRawPlatform } from '@/utils/device'
import { muiDialogV5ReplaceOnClose } from '@/utils/muiDialogV5ReplaceOnClose'
import { resolvePath } from '@/utils/url'
import { useKeyDown } from '@/hooks/useKey'

import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputBase,
  Paper,
} from '@mui/material'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import SearchIcon from '@mui/icons-material/Search'
import { Controller, useForm } from 'react-hook-form'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { debounce } from 'lodash-es'

import type { BlogWithTags } from '@ADMIN/blog/server'

interface FormProps {
  s: string
}

export const SearchSection = NiceModal.create(() => {
  const platform = useRawPlatform()
  const router = useRouter()
  const modal = useModal()
  const [loading, withLoading] = useLoading()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [blogs, setBlogs] = useState<BlogWithTags[]>([])
  const [searchText, setSearchText] = useState('')
  const [isFocusOnInput, setIsFocusOnInput] = useState(false)

  const pathname = usePathname()

  const googleSearchUrl = useMemo(() => {
    if (!searchText.trim()) {
      return undefined
    }
    const url = new URL('https://www.google.com/search')
    const { hostname } = resolvePath('/')
    url.searchParams.set('q', `${searchText} site:${hostname}`)
    return url.href
  }, [searchText])

  // pathname 改变的时候关闭弹窗
  useListen(pathname, (_, prev) => {
    if (prev) {
      void modal.hide()
    }
  })

  useInjectHistory(modal.visible, () => {
    void modal.hide()
  })

  const { handleSubmit, control, setError } = useForm<FormProps>({
    defaultValues: {
      s: '',
    },
  })

  useEffect(() => {
    setSelectedIndex(platform === 'desktop' ? 0 : -1)
  }, [platform, searchText])

  useKeyDown((e: KeyboardEvent) => {
    if (!isFocusOnInput || blogs.length === 0 || e.isComposing) {
      return
    }
    if (e.key === 'Enter') {
      const curBlog = blogs[selectedIndex]
      if (curBlog) {
        e.preventDefault()
        router.push(`/blog/${curBlog.hash}`)
      }
      return
    }
    // 有任何辅助键, 都不 preventDefault
    if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
      return
    }
    if (e.key === 'ArrowUp') {
      // e.preventDefault 配合 autoComplete off, 避免按方向键时触发输入框的下拉推荐
      e.preventDefault()
      setSelectedIndex((selectedIndex - 1 + blogs.length) % blogs.length)
      return
    }
    if (e.key === 'ArrowDown') {
      // e.preventDefault 配合 autoComplete off, 避免按方向键时触发输入框的下拉推荐
      e.preventDefault()
      setSelectedIndex((selectedIndex + 1) % blogs.length)
    }
  })

  const onSubmit = useMemo(
    () =>
      handleSubmit(
        withLoading(
          cat(
            debounce(
              async (e) => {
                const res = await searchBlog(e)
                  .then(SA.decode)
                  .then((list) =>
                    list.filter((item) => `/blog/${item.hash}` !== pathname)
                  )
                if (res.length === 0) {
                  setError('s', {
                    message: '你查找的内容不存在',
                  })
                  return
                }
                setBlogs(res)
              },
              500,
              {
                leading: false,
              }
            )
          )
        )
      ),
    [handleSubmit, pathname, setError, withLoading]
  )

  return (
    <Dialog fullWidth maxWidth='sm' {...muiDialogV5ReplaceOnClose(modal)}>
      {/* zIndex 是 Blog */}
      <DialogTitle sx={{ p: 0, position: 'relative', zIndex: 1 }}>
        <Paper component='form' onSubmit={onSubmit}>
          <Controller
            name='s'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl error={!!error} sx={{ width: '100%' }}>
                <Box
                  sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <InputBase
                    {...field}
                    onChange={(e) => {
                      setSearchText(e.target.value ?? '')
                      field.onChange(e)
                      void onSubmit()
                    }}
                    sx={{ ml: 1, flex: 1 }}
                    autoFocus
                    autoComplete='off'
                    placeholder='搜索 [ctrl + K]'
                    slotProps={{
                      input: {
                        'aria-label': '搜索博客标题和内容 (快捷键 ctrl + K)',
                      },
                    }}
                    onFocus={() => setIsFocusOnInput(true)}
                    onBlur={() => setIsFocusOnInput(false)}
                  />
                  <IconButton
                    type='submit'
                    sx={{ p: '10px' }}
                    aria-label='立即搜索'
                    disabled={loading}
                  >
                    {loading ? (
                      <SvgLoading className='animate-spin text-[24px]' />
                    ) : (
                      <SearchIcon />
                    )}
                  </IconButton>
                  <Divider sx={{ height: 28, m: 0.5 }} orientation='vertical' />
                  <IconButton
                    color='primary'
                    sx={{ p: '10px', opacity: googleSearchUrl ? 1 : 0.6 }}
                    aria-label='跳转谷歌搜索'
                    disabled={!googleSearchUrl}
                    {...obj(
                      googleSearchUrl && {
                        href: googleSearchUrl,
                        target: '_blank',
                      }
                    )}
                  >
                    <SvgGoogle />
                  </IconButton>
                </Box>
                <FormHelperText>{error?.message}&nbsp;</FormHelperText>
              </FormControl>
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
                value: 50,
                message: '最多 50 个字',
              },
            }}
          />
        </Paper>
      </DialogTitle>
      <DialogContent
        sx={{
          height: '400px',
          backgroundColor: 'var(--custom-bg)',
        }}
      >
        <Box sx={{ pointerEvents: 'none', pt: 2 }} />
        <BlogList blogs={blogs} selectedIndex={selectedIndex} />
      </DialogContent>
    </Dialog>
  )
})
