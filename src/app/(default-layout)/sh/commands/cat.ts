import { ShCallableCommand } from '../ShCallableCommand'
import { resolvePath } from '../utils/path'
import { ShFile } from '../ShAsset'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Cat extends ShCallableCommand {
  override async execute() {
    const { fileSystem } = this.terminal
    const { context } = fileSystem
    const targetPath = resolvePath(context.path, this.args[0])
    const asset = fileSystem.getAsset(targetPath)
    if (!asset) {
      throw new Error(`cat: ${targetPath}: No such file or directory`)
    }
    if (!ShFile.isFile(asset)) {
      throw new Error(`cat: ${targetPath}: Is not a file`)
    }
    const content = await asset.getContent()
    this.terminal.log(content)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'cat'
  }
}
