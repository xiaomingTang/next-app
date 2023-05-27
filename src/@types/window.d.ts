import type { HTMLAttributes } from 'react'
import type { PrismaClient, User } from '@prisma/client'
import type toast from 'react-hot-toast'
import type commonConfig from '@ROOT/bin/runtime-scripts/public-config/common.json'
import { PaletteMode } from '@mui/material'

declare global {
  type AppEnv = 'production' | 'preprod'
  var __ENV_CONFIG__: typeof commonConfig & {
    appEnv: AppEnv
  }

  type SimpleUser = Omit<User, 'password' | 'email'> &
    Pick<Partial<User>, 'password' | 'email'>

  interface Window {
    VConsole: new () => any
    toast: typeof toast
  }

  interface Document {
    mozFullScreenElement?: Element
    webkitFullscreenElement?: Element
    msFullscreenElement?: Element

    mozFullScreenEnabled?: Document['fullscreenEnabled']
    webkitFullScreenEnabled?: Document['fullscreenEnabled']
    webkitFullscreenEnabled?: Document['fullscreenEnabled']
    msFullscreenEnabled?: Document['fullscreenEnabled']

    mozCancelFullScreen?: Document['exitFullscreen']
    webkitExitFullscreen?: Document['exitFullscreen']
    webkitExitFullScreen?: Document['exitFullscreen']
    msExitFullscreen?: Document['exitFullscreen']
  }

  interface Element {
    mozRequestFullScreen?: Element['requestFullscreen']
    webkitRequestFullscreen?: Element['requestFullscreen']
    webkitRequestFullScreen?: Element['requestFullscreen']
    msRequestFullscreen?: Element['requestFullscreen']
  }

  interface Error {
    cause?: Error
    code?: number
    message: string
  }
}

export {}
