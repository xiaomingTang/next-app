import { CallableCommand } from '../utils/command'
import { resolvePath } from '../utils/path'

import type { CallableCommandProps } from '../utils/command'

export class Touch extends CallableCommand {
  override async execute() {
    const { fileSystem } = this.terminal
    const { context } = fileSystem
    const targetPath = resolvePath(context.path, this.args[0])
    const file = await fileSystem.createFile(targetPath, '')
    this.terminal.log(`Created file: ${file.name}, path: ${file.path}`)
  }

  constructor(props: CallableCommandProps) {
    super(props)
    this.name = 'touch'
  }
}
