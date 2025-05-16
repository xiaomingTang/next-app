import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import arg from 'arg'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Cp extends ShSimpleCallableCommand {
  descriptions = [
    '用法: cp [OPTION]... <old_path> <new_path>',
    '描述: 复制文件或目录',
    '  --help, -h             显示帮助信息',
    '  --recursive, -r        递归复制目录',
  ]

  override async execute() {
    const args = arg(
      {
        '--recursive': Boolean,
        '-r': '--recursive',
        '--help': Boolean,
        '-h': '--help',
      },
      {
        argv: this.args,
      }
    )
    if (args['--help']) {
      this.vt.log(this.descriptions.join('\r\n'))
      return
    }

    const [oldPath, newPath] = this.pathsRequired(args._[0], args._[1])
    await this.vt.fileSystem.copy(oldPath, newPath, {
      recursive: args['--recursive'],
    })
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'cp'
  }
}
