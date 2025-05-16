import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShSimpleCallableCommandOptions } from '../ShSimpleCallableCommand'
import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Touch extends ShSimpleCallableCommand {
  usage = 'touch [OPTION]... <file>'

  description = 'Create a new file'

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
    const { fileSystem } = this.vt
    const [path] = this.pathsRequired(this.args[0])
    // TODO: 支持传入内容
    await fileSystem.createFile(path, '')
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'touch'
  }
}
