import { ShFileSystem } from '../ShFileSystem'
import { ShDir, ShFile } from '../ShAsset'
import { resolvePath } from '../utils/path'
import { ShRouter } from '../ShRouter'

import { assertNever } from '@/utils/function'

import type { FFmpeg } from '@ffmpeg/ffmpeg'

export class FFmpegFileSystem extends ShFileSystem {
  ffmpeg: FFmpeg

  router: ShRouter

  constructor(props: { root: ShDir; context: ShDir; ffmpeg: FFmpeg }) {
    super(props)
    this.ffmpeg = props.ffmpeg
    this.router = new ShRouter()

    this.router.register('[*file]', async (props) => {
      if (props.type !== 'file') {
        throw new Error(`Invalid type, accept 'file', got: ${props.type}`)
      }
      const path = resolvePath(this.context.path, props.path)
      return new ShFile({
        path,
        getParent: async () => this.context,
        getContent: async () => this.ffmpeg.readFile(path),
        setContent: async (data: Uint8Array | string) => {
          const ok = await this.ffmpeg.writeFile(path, data)
          if (!ok) {
            throw new Error(`Failed to write file: ${path}`)
          }
        },
        getSize: async () => {
          const f = await this.ffmpeg.readFile(path)
          if (typeof f === 'string') {
            return new TextEncoder().encode(f).length
          }
          return f.byteLength
        },
      })
    })

    this.router.register('[*dir]', async (props) => {
      if (props.type !== 'dir') {
        throw new Error(`Invalid type, accept 'dir', got: ${props.type}`)
      }
      const path = resolvePath(this.context.path, props.path)
      return new ShDir({
        path,
        getParent: async () => this.context,
        getChildren: async () => {
          const assetInfos = await this.ffmpeg.listDir(path)
          const assets = assetInfos.map((node) => {
            if (node.isDir) {
              return this.router.generate('[*dir]', {
                type: 'dir',
                path,
              })
            }
            return this.router.generate('[*file]', {
              type: 'file',
              path,
            })
          })
          return Promise.all(assets)
        },
      })
    })
  }

  async deleteAsset(asset: ShFile | ShDir): Promise<void> {
    if (ShFile.isFile(asset)) {
      await this.ffmpeg.deleteFile(asset.path)
    } else if (ShDir.isDir(asset)) {
      await this.ffmpeg.deleteDir(asset.path)
    } else {
      assertNever(asset)
    }
    await super.deleteAsset(asset)
  }

  async createFile(
    input: string,
    content: Uint8Array | string
  ): Promise<ShFile> {
    const path = resolvePath(this.context.path, input)
    const file = await this.router.generate('[*file]', {
      type: 'file',
      path,
    })
    await this.createAsset(file)
    try {
      const ok = await this.ffmpeg.writeFile(path, content)
      if (!ok) {
        throw new Error(`FFmpeg failed to write file: ${path}`)
      }
    } catch (e) {
      await this.deleteAsset(file)
      throw e
    }
    return file
  }

  async createDir(input: string): Promise<ShDir> {
    const path = resolvePath(this.context.path, input)
    const dir = await this.router.generate('[*dir]', {
      type: 'dir',
      path,
    })
    await this.createAsset(dir)
    try {
      const ok = await this.ffmpeg.createDir(path)
      if (!ok) {
        throw new Error(`FFmpeg failed to create dir: ${path}`)
      }
    } catch (e) {
      await this.deleteAsset(dir)
      throw e
    }
    return dir
  }
}
