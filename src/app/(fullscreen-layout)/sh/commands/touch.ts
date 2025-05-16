import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'
import { linkAddon } from '../utils/link'

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
    const filename = this.args[0]
    if (!filename) {
      this.vt.log('Error: No file name provided')
      return
    }
    const { name, path } = await fileSystem.createFile(filename, '')
    this.vt.log(`Created:`, linkAddon.file(name, path))
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'touch'
  }
}
