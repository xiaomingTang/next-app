import Link from 'next/link'
import { forwardRef } from 'react'

import type { ForwardedRef } from 'react'
import type { LinkProps } from 'next/link'

function RawCustomLink(props: LinkProps, ref: ForwardedRef<HTMLAnchorElement>) {
  return <Link prefetch={false} ref={ref} {...props} />
}

export const CustomLink = forwardRef(RawCustomLink)
