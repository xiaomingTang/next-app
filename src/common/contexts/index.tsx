'use client'

import { usePrefersColorSchema } from './PrefersColorSchema'
import { ToastContext } from './ToastContext'

import { useUser } from '@/user'

import { useEffect } from 'react'

export default function Contexts() {
  useEffect(() => {
    useUser.init()
    usePrefersColorSchema.init()
  }, [])

  return (
    <>
      <ToastContext />
    </>
  )
}
