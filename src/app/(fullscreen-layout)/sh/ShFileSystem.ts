import { ShFile, ShDir } from './ShAsset'
import { resolvePath } from './utils/path'

import type { ShRouter } from './ShRouter'

export class ShFileSystem {
  root: ShDir

  context: ShDir

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: ShRouter<any>

  // TODO: 自己管理个毛线，全部从 remote 拿
  assets: Record<string, ShFile | ShDir> = {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(props: { router: ShRouter<any> }) {
    this.router = props.router
    this.context = new ShDir({
      path: '/',
      getParent: async () => this.root,
      getChildren: async () => [],
    })
    this.root = this.context
    this.root = this.router.generate('[ROOT]', {
      type: 'dir',
      path: '/',
      ctx: this,
    })
    this.context = this.root
    void this.createAsset(this.root)
  }

  async createAsset(asset: ShFile | ShDir) {
    if (this.assets[asset.path]) {
      throw new Error(`Asset already exists: ${asset.path}`)
    }
    if (!asset.path.startsWith(this.root.path)) {
      throw new Error(`Cannot create asset outside root: ${this.root.path}`)
    }
    this.assets[asset.path] = asset
  }

  async deleteAsset(asset: ShFile | ShDir) {
    delete this.assets[asset.path]
  }

  getAsset(path: string): ShFile | ShDir | null {
    const np = resolvePath(this.context.path, path)
    return this.assets[np] ?? null
  }

  async createFile(_path: string, _content: string): Promise<ShFile> {
    throw new Error('Not implemented')
  }

  async createDir(_path: string): Promise<ShDir> {
    throw new Error('Not implemented')
  }

  async getFileOrThrow(path: string): Promise<ShFile> {
    const asset = this.getAsset(path)
    if (!asset) {
      throw new Error(`No such file or directory: ${path}`)
    }
    if (!ShFile.isFile(asset)) {
      throw new Error(`Not a file: ${path}`)
    }
    return asset
  }

  async getDirOrThrow(path: string): Promise<ShDir> {
    const asset = this.getAsset(path)
    if (!asset) {
      throw new Error(`No such file or directory: ${path}`)
    }
    if (!ShDir.isDir(asset)) {
      throw new Error(`Not a directory: ${path}`)
    }
    return asset
  }
}
