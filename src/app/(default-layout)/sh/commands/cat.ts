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
    const f = this.terminal.fileSystem.getFileOrThrow(this.args[0])
    const content = await f.getContent()
    this.terminal.log(content)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'cat'
  }
}
