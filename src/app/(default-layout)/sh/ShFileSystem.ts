import type { ShFile } from './ShAsset'
import type { ShDir } from './ShAsset'

export class ShFileSystem {
  root: ShDir

  context: ShDir

  assets: Record<string, ShFile | ShDir> = {}

  constructor(props: { root: ShDir; context: ShDir }) {
    this.root = props.root
    this.context = props.context
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
    return this.assets[path] ?? null
  }

  async createFile(_path: string, _content: string): Promise<ShFile> {
    throw new Error('Not implemented')
  }

  async createDir(_path: string): Promise<ShDir> {
    throw new Error('Not implemented')
  }
}
