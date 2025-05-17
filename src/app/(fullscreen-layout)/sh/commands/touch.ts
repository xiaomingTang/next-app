import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import arg from 'arg'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Touch extends ShSimpleCallableCommand {
  descriptions = [
    '用法: touch [OPTION]... <path>',
    '描述: 创建一个空文件',
    '  --content, -c         指定文件的内容，默认是空文件',
    '  --help, -h             显示帮助信息',
  ]

  override async execute() {
    const args = arg(
      {
        '--content': String,
        '-c': '--content',
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
    await fileSystem.writeFile(path, args['--content'] || '')
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'touch'
  }
}
