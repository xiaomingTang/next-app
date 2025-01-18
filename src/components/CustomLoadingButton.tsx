import { useLoading } from '@/hooks/useLoading'

import { Button } from '@mui/material'

import type { ButtonProps } from '@mui/material'

export function CustomLoadingButton(props: ButtonProps) {
  const [loading, withLoading] = useLoading()
  return (
    <Button
      {...props}
      loading={props.loading ?? loading}
      onClick={props.onClick && withLoading(props.onClick)}
    />
  )
}
