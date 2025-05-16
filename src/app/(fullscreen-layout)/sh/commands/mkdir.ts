import { resolvePath } from '../utils/path'
import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'
import { linkAddon } from '../utils/link'

import type { ShSimpleCallableCommandOptions } from '../ShSimpleCallableCommand'
import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Mkdir extends ShSimpleCallableCommand {
  usage = 'mkdir [OPTION]... <dir>'

  description = 'Create a new directory'

  options: ShSimpleCallableCommandOptions[] = [
    {
      shortName: 'h',
      longName: 'help',
      description: 'Show help message',
      type: 'boolean',
    },
  ]

  override async execute() {
    this.normalizeOptionsAndArgs({
      withSimpleHelp: true,
    })
    const { fileSystem } = this.terminal
    const { context } = fileSystem
    const targetPath = resolvePath(context.path, this.args[0])
    const { name, path } = await fileSystem.createDir(targetPath)
    this.terminal.log(`Created:`, linkAddon.dir(name, path))
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'mkdir'
  }
}
