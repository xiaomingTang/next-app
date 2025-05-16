import { ShFileSystem } from '../ShFileSystem'
import { ShDir, ShFile } from '../ShAsset'
import { resolvePath } from '../utils/path'
import { ShRouter } from '../ShRouter'

import { assertNever } from '@/utils/function'

import type { FFmpeg } from '@ffmpeg/ffmpeg'

const router = new ShRouter<FFmpegFileSystem>()

router.register('[*file]', (props) => {
  if (props.type !== 'file') {
    throw new Error(`Invalid type, accept 'file', got: ${props.type}`)
  }
  const { ctx } = props
  const path = resolvePath(ctx.context.path, props.path)
  return new ShFile({
    path,
    getParent: async () => ctx.context,
    getContent: async () => ctx.ffmpeg.readFile(path),
    setContent: async (data: Uint8Array | string) => {
      const ok = await ctx.ffmpeg.writeFile(path, data)
      if (!ok) {
        throw new Error(`Failed to write file: ${path}`)
      }
    },
    getSize: async () => {
      const f = await ctx.ffmpeg.readFile(path)
      if (typeof f === 'string') {
        return new TextEncoder().encode(f).length
      }
      return f.byteLength
    },
  })
})

router.register('[*dir]', (props) => {
  if (props.type !== 'dir') {
    throw new Error(`Invalid type, accept 'dir', got: ${props.type}`)
  }
  const { ctx } = props
  const path = resolvePath(ctx.context.path, props.path)
  return new ShDir({
    path,
    getParent: async () => ctx.context,
    getChildren: async () => {
      const assetInfos = (await ctx.ffmpeg.listDir(path)).filter(
        (f) => f.name !== '.' && f.name !== '..'
      )
      return assetInfos.map((node) => {
        const nodePath = resolvePath(path, node.name)
        if (node.isDir) {
          return ctx.router.generate('[*dir]', {
            type: 'dir',
            path: nodePath,
            ctx,
          })
        }
        return ctx.router.generate('[*file]', {
          type: 'file',
          path: nodePath,
          ctx,
        })
      })
    },
  })
})

export class FFmpegFileSystem extends ShFileSystem {
  ffmpeg: FFmpeg

  router: ShRouter<FFmpegFileSystem>

  constructor(props: { ffmpeg: FFmpeg }) {
    super({ ...props, router })
    this.ffmpeg = props.ffmpeg
    this.router = router
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
    const file = this.router.generate('[*file]', {
      type: 'file',
      path,
      ctx: this,
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
    const dir = this.router.generate('[*dir]', {
      type: 'dir',
      path,
      ctx: this,
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

  async getFileOrThrow(path: string): Promise<ShFile> {
    if (!path) {
      throw new Error('Path is required')
    }
    const normalizedPath = resolvePath(this.context.path, path)
    const name = normalizedPath.split('/').pop()
    const parentPath = resolvePath(normalizedPath, '..')
    const siblings = (await this.ffmpeg.listDir(parentPath)).filter(
      (f) => f.name !== '.' && f.name !== '..'
    )
    const assetInfo = siblings.find((f) => f.name === name)
    if (!assetInfo) {
      throw new Error(`No such file or directory: ${path}`)
    }
    if (assetInfo.isDir) {
      throw new Error(`Path is a directory: ${path}`)
    }
    return this.router.generate('[*file]', {
      type: 'file',
      path,
      ctx: this,
    })
  }

  async getDirOrThrow(path: string): Promise<ShDir> {
    if (!path) {
      path = '.'
    }
    const normalizedPath = resolvePath(this.context.path, path)
    const name = normalizedPath.split('/').pop()
    if (!name) {
      return this.root
    }
    const parentPath = resolvePath(normalizedPath, '..')
    const siblings = (await this.ffmpeg.listDir(parentPath)).filter(
      (f) => f.name !== '.' && f.name !== '..'
    )
    const assetInfo = siblings.find((f) => f.name === name)
    if (!assetInfo) {
      throw new Error(`No such file or directory: ${path}`)
    }
    if (!assetInfo.isDir) {
      throw new Error(`Path is a file: ${path}`)
    }
    return this.router.generate('[*dir]', {
      type: 'dir',
      path,
      ctx: this,
    })
  }
}
