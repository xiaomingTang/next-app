'use client'

import { ToastContext } from './ToastContext'
import { GlobalStyles } from './GlobalStyles'

import { useUser } from '@/user'

export default function Contexts() {
  useUser.useInit()

  return (
    <>
      <GlobalStyles />
      <ToastContext />
    </>
  )
}
