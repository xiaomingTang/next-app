import { CallableCommand } from '../utils/command'
import { resolvePath } from '../utils/path'
import { ShFile } from '../ShAsset'

import type { CallableCommandProps } from '../utils/command'

export class Vi extends CallableCommand {
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

  constructor(props: CallableCommandProps) {
    super(props)
    this.name = 'vi'
  }
}
