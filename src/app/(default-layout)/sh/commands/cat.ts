import { CallableCommand } from '../utils/command'
import { resolvePath } from '../utils/path'
import { ShFile } from '../ShAsset'

import type { CallableCommandProps } from '../utils/command'

export class Cat extends CallableCommand {
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

  constructor(props: CallableCommandProps) {
    super(props)
    this.name = 'cat'
  }
}
