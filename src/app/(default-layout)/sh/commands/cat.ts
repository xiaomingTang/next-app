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
    },
  ]

  override async execute() {
    this.normalizeOptions({
      withSimpleHelp: true,
      withValidate: true,
    })
    const { fileSystem } = this.terminal
    const f = fileSystem.getFileOrThrow(this.args[0])
    const content = await f.getContent()
    this.terminal.log(content)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'cat'
  }
}
