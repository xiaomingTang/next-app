import NextLink from 'next/link'

import type { LinkProps } from 'next/link'

export function Link({
  ...props
}: LinkProps & {
  children?: React.ReactNode | React.ReactNode[]
}) {
  return <NextLink {...props} />
}
