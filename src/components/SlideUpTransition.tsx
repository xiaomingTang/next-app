'use client'

import { forwardRef } from 'react'
import Slide from '@mui/material/Slide'
import { Fade } from '@mui/material'

import type { TransitionProps } from '@mui/material/transitions'

function RawSlideUpTransition(
  props: TransitionProps & {
    children: React.ReactElement
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
}

export const SlideUpTransition = forwardRef(RawSlideUpTransition)

function RawFadeTransition(
  props: TransitionProps & {
    children: React.ReactElement
  },
  ref: React.Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
}

export const FadeTransition = forwardRef(RawFadeTransition)

export const DefaultDialogTransition = FadeTransition
