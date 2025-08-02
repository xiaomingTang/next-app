import type { ShDir, ShFile } from './ShAsset'

interface RecursiveOptions {
  /**
   * @default false
   */
  recursive?: boolean
}

export abstract class ShFileSystem {
  abstract root: ShDir

  abstract context: ShDir

  constructor() {}

  abstract copy(
    _oldPath: string,
    _newPath: string,
    _options?: RecursiveOptions
  ): Promise<void>
  abstract delete(_path: string, _options?: RecursiveOptions): Promise<void>
  abstract move(_oldPath: string, _newPath: string): Promise<void>
  abstract listDir(_path: string): Promise<(ShDir | ShFile)[]>
  abstract getFileContent(
    _path: string
  ): Promise<Uint8Array<ArrayBuffer> | string>
  abstract writeFile(
    _path: string,
    _content: Uint8Array<ArrayBuffer> | string
  ): Promise<void>
  abstract createDir(_path: string, _options?: RecursiveOptions): Promise<ShDir>
  abstract getFileOrThrow(_path: string): Promise<ShFile>
  abstract getDirOrThrow(_path: string): Promise<ShDir>
}
