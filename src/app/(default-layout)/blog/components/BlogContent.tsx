'use client'

import './styles/markdown-overrides.css'
import 'react-photo-view/dist/react-photo-view.css'

import { markdownComponents } from './markdownComponents'
import { BLOG_MARKDOWN_ID } from './constants'

import { cat } from '@/errors/catchAndToast'
import { useUser } from '@/user'
import { useInjectHistory } from '@/hooks/useInjectHistory'
import Anchor from '@/components/Anchor'
import { BlogTypeMap } from '@ADMIN/blog/components/constants'
import { editBlog } from '@ADMIN/blog/components/EditBlog'
import { useLoading } from '@/hooks/useLoading'
import SvgLoading from '@/svg/assets/loading.svg?icon'
import SvgSolana from '@/svg/assets/solana.svg?icon'
import Span from '@/components/Span'
import { CopyIcon, useCopy } from '@/components/CopyIcon'

import { MDXRemote } from 'next-mdx-remote'
import {
  Typography,
  NoSsr,
  IconButton,
  Skeleton,
  alpha,
  Stack,
  ButtonBase,
} from '@mui/material'
import { PhotoProvider } from 'react-photo-view'
import BorderColorIcon from '@mui/icons-material/BorderColor'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useRef, useState } from 'react'
import { blue, common } from '@mui/material/colors'
import { noop } from 'lodash-es'

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
  ref?: React.ForwardedRef<HTMLDivElement>
}

const addr = process.env.NEXT_PUBLIC_CYBER_BEGGER_ADDRESS
const beggerAddr = {
  full: addr,
  short: addr.slice(0, 6) + '...' + addr.slice(-4),
}

export function BlogContent({ mode = 'production', ref, ...blog }: DraftProps) {
  const user = useUser()
  const [previewVisible, setPreviewVisible] = useState(false)
  const closeRef = useRef(noop)
  const [loading, withLoading] = useLoading()
  const [copied, copy] = useCopy()

  useInjectHistory(previewVisible, () => {
    closeRef.current()
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
        <Span
          sx={{
            color: 'warning.main',
            fontWeight: 'bold',
          }}
        >
          [预览]{' '}
        </Span>
      )}
      {blog.type === 'UNPUBLISHED' && <>{BlogTypeMap[blog.type].name} </>}
      {blog.title}
      <NoSsr>
        {mode === 'production' && blog.creator.id === user.id && (
          <IconButton
            color='primary'
            sx={{
              verticalAlign: 'baseline',
              position: 'absolute',
              right: 0,
              top: 0,
            }}
            aria-label='编辑该博客'
            onClick={cat(withLoading(() => editBlog(blog)))}
          >
            {loading && (
              <SvgLoading className='animate-spin text-[length:24px] leading-none' />
            )}
            {!loading && <BorderColorIcon />}
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
        className='markdown-body shadow-sm'
        id={BLOG_MARKDOWN_ID}
        sx={{
          p: 2,
          borderRadius: 1,
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
      {/* cyberbegger */}
      <Stack
        direction='row'
        alignItems='center'
        sx={{ py: 1, fontSize: '0.9em' }}
        useFlexGap
        flexWrap='wrap'
      >
        <Span sx={{ whiteSpace: 'nowrap' }}>如果有帮到你，可以请我喝杯水</Span>
        <ButtonBase
          aria-label='赛博乞讨: solana 地址（点击复制）'
          title='赛博乞讨这一块必须得跟上'
          onClick={cat(() => copy(beggerAddr.full))}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 1,
            cursor: 'copy',
            borderRadius: 1,
            ':focus-visible': {
              outline: `1px solid ${blue[700]}`,
            },
          }}
        >
          <SvgSolana className='inline-block text-sm leading-none' />
          <Span sx={{ mx: '4px' }}>{beggerAddr.short}</Span>
          <CopyIcon copied={copied} sx={{ fontSize: 'inherit' }} />
        </ButtonBase>
      </Stack>
      {/* 版权声明 */}
      <Typography
        component='div'
        sx={{
          p: 2,
          borderRadius: 1,
          boxShadow: 2,
          backgroundColor: '#095261',
          color: alpha(common.white, 0.7),
        }}
      >
        <Typography>
          如非特别声明，本站作品均为原创，遵循
          <b>
            【自由转载-保持署名-非商用-非衍生{' '}
            <Anchor
              href='https://creativecommons.org/licenses/by-nc-nd/3.0/deed.zh'
              bold={false}
              style={{ color: 'inherit' }}
            >
              创意共享 3.0 许可证
              <sup>
                <OpenInNewIcon fontSize='inherit' />
              </sup>
            </Anchor>
            】。
          </b>
        </Typography>
        <Typography mt={2}>
          对于转载作品，如需二次转载，请遵循原作许可。
        </Typography>
      </Typography>
    </>
  )
}
