import { resolvePath } from '../utils/path'
import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Mkdir extends ShSimpleCallableCommand {
  usage = 'mkdir [OPTION]... <dir>'

  description = 'Create a new directory'

  options = [
    {
      shortName: 'h',
      longName: 'help',
      description: 'Show help message',
    },
  ]

  override async execute() {
    this.normalizeOptions({
      withSimpleHelp: true,
      withValidate: true,
    })
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
