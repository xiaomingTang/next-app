import { ShDir, ShFile } from '../ShAsset'
import { resolvePath } from '../utils/path'

import type { ShFileSystem } from '../ShFileSystem'
import type { FFmpeg } from '@ffmpeg/ffmpeg'

export class FFmpegFileSystem implements ShFileSystem {
  root: ShDir

  context: ShDir

  ffmpeg: FFmpeg

  constructor(props: { ffmpeg: FFmpeg }) {
    this.context = new ShDir({
      path: '/',
    })
    this.root = this.context
    this.context = this.root
    this.ffmpeg = props.ffmpeg
  }

  async copyFile(oldPath: string, newPath: string) {
    const content = await this.ffmpeg.readFile(oldPath)
    await this.ffmpeg.writeFile(newPath, content)
  }

  async copyDir(
    oldPath: string,
    newPath: string,
    options?: { recursive?: boolean }
  ) {
    const recursive = options?.recursive ?? false
    const children = await this.ffmpeg.listDir(oldPath)
    if (!recursive && children.length > 0) {
      throw new Error(`Directory is not empty: ${oldPath}`)
    }
    const ok = await this.ffmpeg.createDir(newPath)
    if (!ok) {
      throw new Error(`FFmpeg failed to create dir: ${newPath}`)
    }
    for (const child of children) {
      if (!child.isDir) {
        await this.copyFile(
          resolvePath(oldPath, child.name),
          resolvePath(newPath, child.name)
        )
      } else {
        await this.copyDir(
          resolvePath(oldPath, child.name),
          resolvePath(newPath, child.name),
          options
        )
      }
    }
  }

  async copy(
    oldPath: string,
    newPath: string,
    options?: { recursive?: boolean }
  ) {
    const asset = await this.getAssetOrThrow(oldPath)
    if (ShFile.isFile(asset)) {
      await this.copyFile(oldPath, newPath)
      return
    }
    await this.copyDir(oldPath, newPath, options)
  }

  async move(oldPath: string, newPath: string): Promise<void> {
    await this.ffmpeg.rename(oldPath, newPath)
  }

  async deleteFile(path: string): Promise<void> {
    const ok = await this.ffmpeg.deleteFile(path)
    if (!ok) {
      throw new Error(`FFmpeg failed to delete file: ${path}`)
    }
  }

  async deleteDir(
    path: string,
    options?: { recursive?: boolean }
  ): Promise<void> {
    const recursive = options?.recursive ?? false
    const children = await this.ffmpeg.listDir(path)
    if (children.length === 0) {
      const ok = await this.ffmpeg.deleteDir(path)
      if (!ok) {
        throw new Error(`FFmpeg failed to delete dir: ${path}`)
      }
      return
    }
    if (!recursive) {
      throw new Error(`Directory is not empty: ${path}`)
    }
    for (const child of children) {
      if (!child.isDir) {
        await this.deleteFile(resolvePath(path, child.name))
      } else {
        await this.deleteDir(resolvePath(path, child.name), options)
      }
    }
  }

  async delete(
    path: string,
    options?: {
      recursive?: boolean
    }
  ): Promise<void> {
    const asset = await this.getAssetOrThrow(path)
    if (ShFile.isFile(asset)) {
      await this.deleteFile(path)
      return
    }
    await this.deleteDir(path, options)
  }

  async listDir(path: string): Promise<(ShDir | ShFile)[]> {
    const children = await this.ffmpeg.listDir(path)
    return children
      .filter((child) => child.name !== '.' && child.name !== '..')
      .map((child) => {
        if (child.isDir) {
          return new ShDir({ path: resolvePath(path, child.name) })
        }
        return new ShFile({ path: resolvePath(path, child.name) })
      })
  }

  getFileContent(
    path: string,
    encoding?: string
  ): Promise<string | Uint8Array> {
    return this.ffmpeg.readFile(path, encoding)
  }

  async writeFile(path: string, content: Uint8Array | string): Promise<void> {
    const ok = await this.ffmpeg.writeFile(path, content)
    if (!ok) {
      throw new Error(`FFmpeg failed to write file: ${path}`)
    }
  }

  async createDir(path: string): Promise<ShDir> {
    const ok = await this.ffmpeg.createDir(path)
    if (!ok) {
      throw new Error(`FFmpeg failed to create dir: ${path}`)
    }
    return new ShDir({ path })
  }

  async getAssetOrThrow(path: string): Promise<ShFile | ShDir> {
    if (path === '/') {
      return this.root
    }
    const name = path.split('/').pop()
    const parentPath = resolvePath(path, '..')
    const siblings = (await this.ffmpeg.listDir(parentPath)).filter(
      (f) => f.name !== '.' && f.name !== '..'
    )
    const assetInfo = siblings.find((f) => f.name === name)
    if (!assetInfo) {
      throw new Error(`No such file or directory: ${path}`)
    }
    if (assetInfo.isDir) {
      return new ShDir({ path: path })
    }
    return new ShFile({ path: path })
  }

  async getFileOrThrow(path: string): Promise<ShFile> {
    const asset = await this.getAssetOrThrow(path)
    if (!ShFile.isFile(asset)) {
      throw new Error(`Path is a directory: ${path}`)
    }
    return asset
  }

  async getDirOrThrow(path: string): Promise<ShDir> {
    const asset = await this.getAssetOrThrow(path)
    if (!ShDir.isDir(asset)) {
      throw new Error(`Path is a file: ${path}`)
    }
    return asset
  }
}
