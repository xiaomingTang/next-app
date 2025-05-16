import { ShDir } from './ShAsset'

import type { ShFile } from './ShAsset'
import type { ShRouter } from './ShRouter'

export class ShFileSystem {
  root: ShDir

  context: ShDir

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: ShRouter<any>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(props: { router: ShRouter<any> }) {
    this.router = props.router
    this.context = new ShDir({
      path: '/',
      getParent: async () => this.root,
      getChildren: async () => [],
    })
    this.root = this.context
    this.root = this.router.generate('[*dir]', {
      type: 'dir',
      path: '/',
      ctx: this,
    })
    this.context = this.root
  }

  async deleteAsset(_asset: ShFile | ShDir) {
    throw new Error('Not implemented')
  }

  async moveAsset(_oldPath: string, _newPath: string): Promise<void> {
    throw new Error('Not implemented')
  }

  async createFile(_path: string, _content: string): Promise<ShFile> {
    throw new Error('Not implemented')
  }

  async createDir(_path: string): Promise<ShDir> {
    throw new Error('Not implemented')
  }

  async getFileOrThrow(_path: string): Promise<ShFile> {
    throw new Error('Not implemented')
  }

  async getDirOrThrow(_path: string): Promise<ShDir> {
    throw new Error('Not implemented')
  }
}
