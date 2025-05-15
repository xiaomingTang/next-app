import { ShCallableCommand } from '../ShCallableCommand'
import { resolvePath } from '../utils/path'
import { ShFile } from '../ShAsset'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Vi extends ShCallableCommand {
  override async execute() {
    const { fileSystem } = this.terminal
    const { context } = fileSystem
    const targetPath = resolvePath(context.path, this.args[0])
    const asset = fileSystem.getAsset(targetPath)
    if (!asset) {
      throw new Error(`vi: ${targetPath}: No such file or directory`)
    }
    if (!ShFile.isFile(asset)) {
      throw new Error(`vi: ${targetPath}: Is not a file`)
    }
    // TODO: 用编辑器打开文件
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'vi'
  }
}
