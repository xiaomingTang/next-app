import { forwardRef } from 'react'
import Slide from '@mui/material/Slide'
import { Fade } from '@mui/material'

import type { TransitionProps } from '@mui/material/transitions'

export const SlideUpTransition = forwardRef(function SlideUpTransition(
  props: TransitionProps & {
    children: React.ReactElement
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

export const FadeTransition = forwardRef(function FadeTransition(
  props: TransitionProps & {
    children: React.ReactElement
  },
  ref: React.Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
})

export const DefaultDialogTransition = FadeTransition
