import { ShFile, ShDir } from './ShAsset'

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

  getFileOrThrow(path: string): ShFile {
    const asset = this.getAsset(path)
    if (!asset) {
      throw new Error(`No such file or directory: ${path}`)
    }
    if (!ShFile.isFile(asset)) {
      throw new Error(`Not a file: ${path}`)
    }
    return asset
  }

  getDirOrThrow(path: string): ShDir {
    const asset = this.getAsset(path)
    if (!asset) {
      throw new Error(`No such file or directory: ${path}`)
    }
    if (!ShDir.isDir(asset)) {
      throw new Error(`Not a directory: ${path}`)
    }
    return asset
  }

  async createFile(_path: string, _content: string): Promise<ShFile> {
    throw new Error('Not implemented')
  }

  async createDir(_path: string): Promise<ShDir> {
    throw new Error('Not implemented')
  }
}
