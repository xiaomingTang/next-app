import { Link } from '../CustomLink'

import { resolvePath } from '@/utils/url'

import { clsx } from 'clsx'

import type { LinkProps } from 'next/link'
import type { AnchorHTMLAttributes } from 'react'

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
export default function Anchor({
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
}: AnchorProps) {
  // 站内链接
  const isInternal = resolvePath(href || '').hostname.endsWith(APP_URL.hostname)
  const finalTarget = target ?? (isInternal ? '_self' : '_blank')
  const finalRel = rel ?? (isInternal ? undefined : 'noopener nofollow')

  if (!href || !isInternal) {
    return (
      <a
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
  }

  return (
    <Link
      prefetch={false}
      href={href ?? '/'}
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
      {...linkProps}
    >
      {children}
    </Link>
  )
}
