'use client'

import { InitPrefersColorSchema } from './PrefersColorSchema'
import { ToastContext } from './ToastContext'

export default function Contexts() {
  return (
    <>
      <InitPrefersColorSchema />
      <ToastContext />
    </>
  )
}
