import { ShCallableCommand } from '../ShCallableCommand'
import { resolvePath } from '../utils/path'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Mkdir extends ShCallableCommand {
  override async execute() {
    const { fileSystem } = this.terminal
    const { context } = fileSystem
    const targetPath = resolvePath(context.path, this.args[0])
    const dir = await fileSystem.createDir(targetPath)
    this.terminal.log(`Created dir: ${dir.name}, path: ${dir.path}`)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'mkdir'
  }
}
