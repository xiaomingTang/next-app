import { ShCallableCommand } from '../ShCallableCommand'
import { resolvePath } from '../utils/path'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Touch extends ShCallableCommand {
  override async execute() {
    const { fileSystem } = this.terminal
    const { context } = fileSystem
    const targetPath = resolvePath(context.path, this.args[0])
    const file = await fileSystem.createFile(targetPath, '')
    this.terminal.log(`Created file: ${file.name}, path: ${file.path}`)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'touch'
  }
}
