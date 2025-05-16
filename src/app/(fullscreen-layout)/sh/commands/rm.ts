import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import arg from 'arg'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Rm extends ShSimpleCallableCommand {
  descriptions = [
    '用法: rm [OPTION]... <path>',
    '描述: 删除文件或目录',
    '  --recursive, -r        递归删除目录',
    '  --help, -h             显示帮助信息',
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

    const { fileSystem } = this.vt
    const [path] = this.pathsRequired(args._[0])
    // TODO: 支持传入 recursive 参数
    await fileSystem.delete(path, {
      recursive: args['--recursive'],
    })
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'rm'
  }
}
