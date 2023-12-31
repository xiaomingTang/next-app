import clsx from 'clsx'
import { forwardRef } from 'react'

type ScrollFlagProps = React.HTMLAttributes<HTMLDivElement> & {
  inline?: boolean
}

function RawDefaultLayoutScrollFlag(
  { inline = true, className, ...props }: ScrollFlagProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      // 多 8px, 视觉上更好
      className={clsx(
        '-translate-y-12 md:-translate-y-16 overflow-hidden pointer-events-none',
        inline ? 'inline-block w-0 h-[1em]' : 'block',
        className
      )}
      {...props}
    />
  )
}

export const DefaultLayoutScrollFlag = forwardRef(RawDefaultLayoutScrollFlag)
