import { DELIMITER, resolvePath } from './utils/path'

export interface ShAssetProps {
  path: string
  type?: string
  ctime?: number
  mtime?: number
}

export class ShAsset {
  _isFile = false

  static isAsset(asset?: unknown): asset is ShAsset {
    if (!asset) {
      return false
    }
    const _asset = asset as ShFile | ShDir
    // 目前就只有 ShFile 和 ShDir
    return (
      typeof _asset._isFile === 'boolean' &&
      typeof _asset.path === 'string' &&
      _asset.getParent instanceof Function &&
      _asset.getSize instanceof Function
    )
  }

  private _path = '/'

  /**
   * 绝对路径，作为资源的唯一标识
   */
  get path() {
    return this._path
  }

  set path(value: string) {
    this._path = resolvePath(value)
  }

  get name() {
    return this.path.slice(this.path.lastIndexOf(DELIMITER) + 1)
  }

  type?: string

  /**
   * 创建时间
   */
  ctime?: number

  /**
   * 修改时间
   */
  mtime?: number

  constructor(props: ShAssetProps) {
    this.path = props.path
    this.type = props.type
    this.ctime = props.ctime
    this.mtime = props.mtime
  }
}

export interface ShFileProps extends ShAssetProps {
  getSize: () => Promise<number>
  getParent: () => Promise<ShDir | null>
  getContent: () => Promise<Uint8Array | string>
  setContent: (content: Uint8Array | string) => Promise<void>
}

export class ShFile extends ShAsset {
  _isFile = true

  static isFile(asset?: unknown): asset is ShFile {
    if (!ShAsset.isAsset(asset)) {
      return false
    }
    return (asset as ShFile)._isFile
  }

  getSize: ShFileProps['getSize']

  getParent: ShFileProps['getParent']

  getChildren() {
    return Promise.resolve<never[]>([])
  }

  getContent: ShFileProps['getContent']

  setContent: ShFileProps['setContent']

  constructor(props: ShFileProps) {
    super(props)
    this.getSize = props.getSize
    this.getParent = props.getParent
    this.getContent = props.getContent
    this.setContent = props.setContent
  }
}

export interface ShDirProps extends ShAssetProps {
  getParent: () => Promise<ShDir | null>
  getChildren: () => Promise<(ShFile | ShDir)[]>
}

export class ShDir extends ShAsset {
  _isFile = false

  static isDir(asset?: unknown): asset is ShDir {
    if (!ShAsset.isAsset(asset)) {
      return false
    }
    return !(asset as ShFile)._isFile
  }

  getParent: () => Promise<ShDir | null>

  getChildren: () => Promise<(ShFile | ShDir)[]>

  async getSize() {
    const children = await this.getChildren()
    let size = 0
    for (const child of children) {
      size += await child.getSize()
    }
    return size
  }

  constructor(props: ShDirProps) {
    super(props)
    this.getParent = props.getParent
    this.getChildren = props.getChildren
  }
}
