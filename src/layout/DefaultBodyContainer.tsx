import { clsx } from 'clsx'

type DefaultBodyContainerProps = React.HTMLAttributes<HTMLDivElement>

export function DefaultBodyContainer({
  className,
  children,
  ...restProps
}: DefaultBodyContainerProps) {
  return (
    <div
      className={clsx('w-full max-w-screen-desktop m-auto p-4', className)}
      {...restProps}
    >
      {children}
    </div>
  )
}
