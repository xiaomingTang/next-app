'use client'

import './styles/markdown-overrides.scss'
import 'react-photo-view/dist/react-photo-view.css'

import { markdownComponents } from './markdownComponents'
import { BLOG_MARKDOWN_ID } from './constants'

import { cat } from '@/errors/catchAndToast'
import { useUser } from '@/user'
import { useInjectHistory } from '@/hooks/useInjectHistory'
import Anchor from '@/components/Anchor'
import { BlogTypeMap } from '@ADMIN/blog/components/constants'
import { editBlog } from '@ADMIN/blog/components/EditBlog'

import { MDXRemote } from 'next-mdx-remote'
import { Typography, NoSsr, IconButton, Skeleton, alpha } from '@mui/material'
import { PhotoProvider } from 'react-photo-view'
import BorderColorIcon from '@mui/icons-material/BorderColor'
import { forwardRef, useRef, useState } from 'react'
import { common } from '@mui/material/colors'

import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import type { LoadingAble } from '@/components/ServerComponent'
import type { BlogWithTags } from '@ADMIN/blog/server'

type DraftProps = LoadingAble<
  BlogWithTags & {
    source: MDXRemoteSerializeResult
  }
> & {
  /**
   * @default 'production'
   */
  mode?: 'preview' | 'production'
}

function RawBlogContent(
  { mode = 'production', ...blog }: DraftProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const user = useUser()
  const [previewVisible, setPreviewVisible] = useState(false)
  const closeRef = useRef<() => void>()

  useInjectHistory(previewVisible, () => {
    closeRef.current?.()
  })

  const titleElem = blog.loading ? (
    <Skeleton
      width={32 * blog.size}
      height={40}
      sx={{ display: 'inline-block' }}
    />
  ) : (
    <>
      {mode === 'preview' && (
        <Typography
          component='span'
          sx={{
            color: 'warning.main',
            fontWeight: 'bold',
          }}
        >
          [预览]{' '}
        </Typography>
      )}
      {blog.type === 'UNPUBLISHED' && <>{BlogTypeMap[blog.type].name} </>}
      {blog.title}
      <NoSsr>
        {mode === 'production' && blog.creator.id === user.id && (
          <IconButton
            color='primary'
            size='small'
            sx={{
              verticalAlign: 'baseline',
              position: 'absolute',
              right: 0,
              top: 0,
            }}
            aria-label='编辑该博客'
            onClick={cat(() => editBlog(blog))}
          >
            <BorderColorIcon />
          </IconButton>
        )}
      </NoSsr>
    </>
  )

  const contentElem = blog.loading ? (
    <>
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='38%' height={24} />
      <br />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='76%' height={24} />
      <br />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='65%' height={24} />
      <br />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='12%' height={24} />
      <br />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='46%' height={24} />
      <br />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='100%' height={24} />
      <Skeleton width='88%' height={24} />
    </>
  ) : (
    <PhotoProvider
      onVisibleChange={(visible) => {
        setPreviewVisible(visible)
      }}
      toolbarRender={({ onClose }) => {
        closeRef.current = onClose
        return <></>
      }}
    >
      <MDXRemote {...blog.source} components={markdownComponents} />
    </PhotoProvider>
  )

  return (
    <>
      <Typography
        component='article'
        className='markdown-body shadow'
        id={BLOG_MARKDOWN_ID}
        sx={{
          p: 2,
          borderRadius: 1,
          overflow: 'auto',
        }}
        ref={ref}
      >
        {/* 标题 */}
        <Typography
          component='h1'
          sx={{
            position: 'relative',
            textAlign: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            // 空给编辑按钮
            px: '2rem',
          }}
        >
          {titleElem}
        </Typography>
        {contentElem}
      </Typography>
      {/* 版权声明 */}
      <Typography
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 1,
          boxShadow: 2,
          backgroundColor: '#095261',
          color: alpha(common.white, 0.7),
        }}
      >
        版权声明: 自由转载-非商用-非衍生-保持署名{' '}
        <Anchor
          href='https://creativecommons.org/licenses/by-nc-nd/3.0/deed.zh'
          bold={false}
          style={{ color: 'inherit' }}
        >
          (创意共享 3.0 许可证)
        </Anchor>
      </Typography>
    </>
  )
}

export const BlogContent = forwardRef(RawBlogContent)
