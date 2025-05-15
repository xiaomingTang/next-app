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
    const { fileSystem } = this.terminal
    const filename = this.args[0]
    if (!filename) {
      this.terminal.log('Error: No file name provided')
      return
    }
    const file = await fileSystem.createFile(filename, '')
    this.terminal.log(`Created: ${file.path}`)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'touch'
  }
}
