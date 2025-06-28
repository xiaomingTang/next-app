import { PageTransitionEffect } from './components/PageTransitionEffect'

import { STYLE } from '@/config'

import type { PageTransitionEffectProps } from './components/PageTransitionEffect'

export function DefaultBodyContainer({
  children,
  ...restProps
}: PageTransitionEffectProps) {
  return (
    <PageTransitionEffect
      style={{
        width: '100%',
        maxWidth: STYLE.width.desktop,
        minHeight: 'calc(var(--vh,1vh) * 100 - var(--header-height))',
        margin: '0 auto',
        padding: 'calc(2 * var(--mui-spacing))',
      }}
      {...restProps}
    >
      {children}
    </PageTransitionEffect>
  )
}
