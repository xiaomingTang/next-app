'use client'

import NextLink from 'next/link'

import type { LinkProps as NextLinkProps } from 'next/link'

type LinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof NextLinkProps
> &
  NextLinkProps & {
    children?: React.ReactNode | React.ReactNode[]
  } & React.RefAttributes<HTMLAnchorElement>

export function geneLink(defaultProps?: Partial<LinkProps>) {
  function RawLink(props: LinkProps) {
    return <NextLink {...defaultProps} {...props} />
  }

  return RawLink
}

export const Link = geneLink()

export const LinkWithReplace = geneLink({
  replace: true,
})
