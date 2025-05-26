export interface FileLike {
  name: string
  size: number
  type: string
  bytes: Uint8Array
}

interface TrunkStart {
  id: string
  stage: 'start'
  meta: {
    name: string
    size: number
    /**
     * mimetype
     */
    type: string
  }
}

interface TrunkData {
  id: string
  stage: 'data'
  data: Uint8Array
}

interface TrunkEnd {
  id: string
  stage: 'end'
}

declare global {
  type FuncsFromPeer = {
    text: (data: string) => Promise<void>
    image: (data: FileLike) => Promise<void>
    audio: (data: FileLike) => Promise<void>
    video: (data: FileLike) => Promise<void>
    file: (data: FileLike) => Promise<void>
    trunk: (data: TrunkStart | TrunkData | TrunkEnd) => Promise<void>
  }
}

export {}
