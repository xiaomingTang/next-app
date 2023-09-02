import { resolvePath } from '@/utils/url'

import { forwardRef } from 'react'
import { clsx } from 'clsx'
import Link from 'next/link'

import type { LinkProps } from 'next/link'
import type { AnchorHTMLAttributes, ForwardedRef } from 'react'

export interface AnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * @default false
   */
  underline?: boolean
  /**
   * @default false
   */
  underlineOnHover?: boolean
  /**
   * @default true
   */
  bold?: boolean
  linkProps?: LinkProps
}

const APP_URL = resolvePath('/')

/**
 * ``` typescript
 * <Anchor href='https://example.com/'>external link</Anchor>
 * // or
 * <Anchor href='/inner'>inner link</Anchor>
 * ```
 */
// eslint-disable-next-line prefer-arrow-callback
export default forwardRef(function Anchor(
  {
    underline = false,
    underlineOnHover = true,
    bold = true,
    href,
    target,
    rel,
    className,
    children,
    tabIndex = 0,
    linkProps,
    ...props
  }: AnchorProps,
  ref: ForwardedRef<HTMLAnchorElement>
) {
  const isExternal = !resolvePath(href || '').hostname.endsWith(
    APP_URL.hostname
  )
  const finalTarget = target ?? (isExternal ? '_blank' : '_self')
  const finalRel = rel ?? isExternal ? 'noopener noreferrer' : undefined

  const anchor = (
    <a
      ref={ref}
      href={href}
      target={finalTarget}
      rel={finalRel}
      tabIndex={tabIndex}
      className={clsx(
        className,
        'cursor-pointer',
        'text-primary-main active:text-primary-dark dark:text-primary-200 dark:active:text-primary-400',
        underline && 'underline',
        underlineOnHover && 'hover:underline',
        bold && 'font-bold'
      )}
      {...props}
    >
      {children}
    </a>
  )

  if (!href || isExternal) {
    return anchor
  }

  return (
    <Link
      href={href ?? '/'}
      passHref
      legacyBehavior
      prefetch={false}
      {...linkProps}
    >
      {anchor}
    </Link>
  )
})
