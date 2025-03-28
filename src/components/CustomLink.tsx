'use client'

import NextLink from 'next/link'
import { forwardRef } from 'react'

import type { LinkProps as NextLinkProps } from 'next/link'

type LinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof NextLinkProps
> &
  NextLinkProps & {
    children?: React.ReactNode | undefined
  } & React.RefAttributes<HTMLAnchorElement>

export function geneLink(defaultProps?: Partial<LinkProps>) {
  function RawLink(
    props: LinkProps & {
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
