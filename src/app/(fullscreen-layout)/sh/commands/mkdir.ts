import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import arg from 'arg'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Mkdir extends ShSimpleCallableCommand {
  descriptions = [
    '用法: mkdir [OPTION]... <path>',
    '描述: 创建目录',
    '  --recursive, -r        递归创建目录',
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
    console.log(args)
    await fileSystem.createDir(path, {
      recursive: args['--recursive'],
    })
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'mkdir'
  }
}
