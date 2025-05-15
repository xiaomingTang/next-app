import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShSimpleCallableCommandOptions } from '../ShSimpleCallableCommand'
import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Cat extends ShSimpleCallableCommand {
  usage = 'cat [OPTION]... <file>'

  description = 'Print the content of a file to the terminal'

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
    const f = await this.terminal.fileSystem.getFileOrThrow(this.args[0])
    const content = await f.getContent()
    this.terminal.debug('cat content: ', content)
    if (typeof content === 'string') {
      this.terminal.log(content)
    } else {
      const uint8 = new Uint8Array(content)
      this.terminal.log(new TextDecoder().decode(uint8))
    }
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'cat'
  }
}
