import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Cat extends ShSimpleCallableCommand {
  usage = 'cat [OPTION]... <file>'

  description = 'Print the content of a file to the terminal'

  options = [
    {
      shortName: 'h',
      longName: 'help',
      description: 'Show help message',
      type: 'boolean' as const,
    },
  ]

  override async execute() {
    this.normalizeOptionsAndArgs({
      withSimpleHelp: true,
    })
    const f = await this.terminal.fileSystem.getFileOrThrow(this.args[0])
    const content = await f.getContent()
    if (typeof content === 'string') {
      this.terminal.log(content)
    } else {
      this.terminal.log('Uint8Array<ArrayBufferLike>')
    }
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'cat'
  }
}
