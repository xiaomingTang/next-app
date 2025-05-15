import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShSimpleCallableCommandOptions } from '../ShSimpleCallableCommand'
import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Vi extends ShSimpleCallableCommand {
  usage = 'vi [OPTION]... <file>'

  description = 'Open a file in the editor'

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
    const f = await fileSystem.getFileOrThrow(this.args[0])
    // TODO: 用编辑器打开文件
    this.terminal.log(`TODO: Open file: ${f.name}, path: ${f.path}`)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'vi'
  }
}
