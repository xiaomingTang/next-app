import NextLink from 'next/link'
import { forwardRef } from 'react'

import type { LinkProps } from 'next/link'

function RawLink(
  {
    ...props
  }: LinkProps & {
    children?: React.ReactNode | React.ReactNode[]
  },
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  return <NextLink ref={ref} {...props} />
}

export const Link = forwardRef(RawLink)
