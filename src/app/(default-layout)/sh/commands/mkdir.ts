import { CallableCommand } from '../utils/command'
import { resolvePath } from '../utils/path'

import type { CallableCommandProps } from '../utils/command'

export class Mkdir extends CallableCommand {
  override async execute() {
    const { fileSystem } = this.terminal
    const { context } = fileSystem
    const targetPath = resolvePath(context.path, this.args[0])
    const dir = await fileSystem.createDir(targetPath)
    this.terminal.log(`Created dir: ${dir.name}, path: ${dir.path}`)
  }

  constructor(props: CallableCommandProps) {
    super(props)
    this.name = 'mkdir'
  }
}
