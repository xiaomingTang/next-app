import { resolvePath } from '../utils/path'
import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Vi extends ShSimpleCallableCommand {
  usage = 'vi [OPTION]... <file>'

  description = 'Open a file in the editor'

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
    const { fileSystem } = this.terminal
    const { context } = fileSystem
    const targetPath = resolvePath(context.path, this.args[0])
    const f = fileSystem.getFileOrThrow(targetPath)
    // TODO: 用编辑器打开文件
    this.terminal.log(`TODO: Open file: ${f.name}, path: ${f.path}`)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'vi'
  }
}
