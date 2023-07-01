import { useLoading } from '@/hooks/useLoading'

import { LoadingButton } from '@mui/lab'

import type { LoadingButtonProps } from '@mui/lab'

export type CustomLoadingButtonProps = LoadingButtonProps

export function CustomLoadingButton(props: CustomLoadingButtonProps) {
  const { loading, withLoading } = useLoading()
  return (
    <LoadingButton
      {...props}
      loading={props.loading ?? loading}
      onClick={props.onClick && withLoading(props.onClick)}
    />
  )
}
