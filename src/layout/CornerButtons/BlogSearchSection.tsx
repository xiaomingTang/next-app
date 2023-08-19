'use client'

import { SlideUpTransition } from '@/components/SlideUpTransition'
import { cat } from '@/errors/catchAndToast'
import { searchBlog } from '@/app/admin/blog/server'
import { SA } from '@/errors/utils'
import { useLoading } from '@/hooks/useLoading'
import { SvgGoogle, SvgLoading } from '@/svg'
import { BlogList } from '@/app/blog/components/BlogList'
import { dark, light } from '@/utils/theme'
import { ENV_CONFIG } from '@/config'
import { obj } from '@/utils/tiny'
import { useInjectHistory } from '@/hooks/useInjectHistory'

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
import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import SearchIcon from '@mui/icons-material/Search'
import { Controller, useForm } from 'react-hook-form'
import { useMemo, useState } from 'react'

import type { BlogWithTags } from '@/app/admin/blog/server'

interface FormProps {
  s: string
}

export const BlogSearchSection = NiceModal.create(() => {
  const modal = useModal()

  useInjectHistory(modal.visible, async () => {
    modal.hide()
  })

  const [loading, withLoading] = useLoading()
  const { handleSubmit, control, setError } = useForm<FormProps>({
    defaultValues: {
      s: '',
    },
  })
  const [blogs, setBlogs] = useState<BlogWithTags[]>([])
  const [searchText, setSearchText] = useState('')
  const googleSearchUrl = useMemo(() => {
    if (!searchText.trim()) {
      return undefined
    }
    const url = new URL('https://www.google.com/search')
    const { hostname } = new URL(ENV_CONFIG.public.origin)
    url.searchParams.set('q', `${searchText} site:${hostname}`)
    return url.href
  }, [searchText])

  const onSubmit = handleSubmit(
    withLoading(
      cat(async (e) => {
        const res = await searchBlog(e).then(SA.decode)
        if (res.length === 0) {
          setError('s', {
            message: '你查找的内容不存在',
          })
          return
        }
        setBlogs(res)
      })
    )
  )

  return (
    <Dialog
      {...muiDialogV5(modal)}
      TransitionComponent={SlideUpTransition}
      fullWidth
      maxWidth='sm'
      onClose={() => {
        modal.hide()
      }}
    >
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
                    }}
                    sx={{ ml: 1, flex: 1 }}
                    autoFocus
                    placeholder='搜索文章'
                    inputProps={{
                      'aria-label': '搜索文章',
                    }}
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
          [dark()]: {
            backgroundColor: '#4d4d4d',
          },
          [light()]: {
            backgroundColor: '#eee',
          },
        }}
      >
        <Box sx={{ pointerEvents: 'none', pt: 2 }} />
        <BlogList blogs={blogs} />
      </DialogContent>
    </Dialog>
  )
})
