'use client'

import { usePrefersColorSchema } from './PrefersColorSchema'

import { SvgError, SvgLoading, SvgSuccess } from '@/svg'

import { Toaster } from 'react-hot-toast'

export function ToastContext() {
  const { mode } = usePrefersColorSchema()
  return (
    <Toaster
      gutter={8}
      toastOptions={{
        style: {
          borderRadius: '4px',
          padding: '4px 8px',
          backgroundColor: mode === 'dark' ? '#ccc' : 'white',
        },
        success: {
          icon: <SvgSuccess className='fill-primary-light text-[18px]' />,
        },
        loading: {
          // 默认 Infinity, 但是这里设置为 4000ms
          // 需要 Infinity 时自己明确设置
          duration: 4000,
          icon: <SvgLoading className='animate-spin text-[18px]' />,
        },
        error: {
          icon: <SvgError className='fill-error-light text-[18px]' />,
        },
      }}
    />
  )
}
