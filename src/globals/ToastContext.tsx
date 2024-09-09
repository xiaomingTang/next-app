import SvgError from '@/svg/assets/error.svg?icon'
import SvgLoading from '@/svg/assets/loading.svg?icon'
import SvgSuccess from '@/svg/assets/success.svg?icon'

import { Toaster } from 'react-hot-toast'

export function ToastContext() {
  return (
    <Toaster
      gutter={8}
      toastOptions={{
        className: 'toaster',
        success: {
          icon: (
            <SvgSuccess className='fill-primary-light text-[18px] flex-[0_0_auto]' />
          ),
        },
        loading: {
          // 默认 Infinity, 但是这里设置为 4000ms
          // 需要 Infinity 时自己明确设置
          duration: 4000,
          icon: (
            <SvgLoading className='animate-spin text-[18px] flex-[0_0_auto]' />
          ),
        },
        error: {
          icon: (
            <SvgError className='fill-error-light text-[18px] flex-[0_0_auto]' />
          ),
        },
      }}
    />
  )
}
