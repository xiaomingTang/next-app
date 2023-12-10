'use client'

import { ToastContext } from './ToastContext'
import { GlobalStyles } from './GlobalStyles'

import { useUser } from '@/user'

import { useEffect } from 'react'

export default function Contexts() {
  useEffect(() => {
    useUser.init()
  }, [])

  return (
    <>
      <GlobalStyles />
      <ToastContext />
    </>
  )
}
