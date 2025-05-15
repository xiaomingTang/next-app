import { ShDir } from '../ShAsset'
import { ShCallableCommand } from '../ShCallableCommand'
import { resolvePath } from '../utils/path'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Cd extends ShCallableCommand {
  override async execute() {
    const { fileSystem } = this.terminal
    const { context } = fileSystem
    const targetPath = resolvePath(context.path, this.args[0])
    const asset = fileSystem.getAsset(targetPath)
    if (!asset) {
      throw new Error(`cat: ${targetPath}: No such file or directory`)
    }
    if (!ShDir.isDir(asset)) {
      throw new Error(`cd: ${targetPath}: Not a directory`)
    }
    fileSystem.context = asset
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'cd'
  }
}
