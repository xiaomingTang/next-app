'use client'

import NextLink from 'next/link'
import { forwardRef } from 'react'

import type { LinkProps } from 'next/link'

export function geneLink(defaultProps?: Partial<LinkProps>) {
  function RawLink(
    {
      ...props
    }: LinkProps & {
      children?: React.ReactNode | React.ReactNode[]
    },
    ref: React.ForwardedRef<HTMLAnchorElement>
  ) {
    return <NextLink ref={ref} {...defaultProps} {...props} />
  }

  return forwardRef(RawLink)
}

export const Link = geneLink()

export const LinkWithReplace = geneLink({
  replace: true,
})
