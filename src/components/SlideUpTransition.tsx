'use client'

import { forwardRef } from 'react'
import Slide from '@mui/material/Slide'

import type { TransitionProps } from '@mui/material/transitions'

function RawTransition(
  props: TransitionProps & {
    children: React.ReactElement
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
}

export const SlideUpTransition = forwardRef(RawTransition)
