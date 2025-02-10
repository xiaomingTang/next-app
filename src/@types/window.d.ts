import type { User } from '@prisma/client'

declare global {
  type SimpleUser = Omit<User, 'password' | 'email'> &
    Pick<Partial<User>, 'password' | 'email'>

  interface Window {
    webkitAudioContext: typeof AudioContext
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

  interface IosDeviceOrientationEvent {
    requestPermission?: () => Promise<PermissionState>
  }

  type OrientationLockType =
    | 'any'
    | 'landscape'
    | 'landscape-primary'
    | 'landscape-secondary'
    | 'natural'
    | 'portrait'
    | 'portrait-primary'
    | 'portrait-secondary'
  interface ScreenOrientation extends EventTarget {
    lock(orientation: OrientationLockType): Promise<void>
  }
}

export {}
