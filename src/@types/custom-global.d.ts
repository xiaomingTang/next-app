import type { CustomMP3 } from '@prisma/client'

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var mp3s: CustomMP3[]
}
export {}
