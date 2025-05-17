import { DELIMITER, resolvePath } from './utils/path'

export interface ShAssetProps {
  path: string
  type?: 'file' | 'dir'
}

export class ShAsset {
  private __IMPOSSIBLE__DUPLICATE__IS_SH_ASSET__ = true

  static isAsset(asset: unknown): asset is ShAsset {
    return !!(asset as ShAsset)?.__IMPOSSIBLE__DUPLICATE__IS_SH_ASSET__
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

  /**
   * 可能为空
   */
  get name() {
    return this.path.slice(this.path.lastIndexOf(DELIMITER) + 1)
  }

  type?: string

  constructor(props: ShAssetProps) {
    this.path = props.path
    this.type = props.type
  }
}

export class ShFile extends ShAsset {
  private __IMPOSSIBLE__DUPLICATE__IS_SH_FILE__ = true

  static isFile(asset: unknown): asset is ShFile {
    return !!(asset as ShFile)?.__IMPOSSIBLE__DUPLICATE__IS_SH_FILE__
  }

  constructor(props: Omit<ShAssetProps, 'type'>) {
    super({ ...props, type: 'file' })
  }
}

export class ShDir extends ShAsset {
  private __IMPOSSIBLE__DUPLICATE__IS_SH_DIR__ = true

  static isDir(asset: unknown): asset is ShDir {
    return !!(asset as ShDir)?.__IMPOSSIBLE__DUPLICATE__IS_SH_DIR__
  }

  constructor(props: Omit<ShAssetProps, 'type'>) {
    super({ ...props, type: 'dir' })
  }
}
