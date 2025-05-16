import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import mime from 'mime-types'
import arg from 'arg'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Download extends ShSimpleCallableCommand {
  descriptions = [
    '用法: download [OPTION]... <path>',
    '描述: 下载文件',
    '  --mimetype, -m         指定文件的 MIME 类型，默认根据文件名推断',
    '  --help, -h             显示帮助信息',
  ]

  override async execute() {
    const args = arg(
      {
        '--mimetype': String,
        '-m': '--mimetype',
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

    const { vt } = this
    const { fileSystem } = vt
    const [path] = this.pathsRequired(args._[0])
    const name = path.split('/').pop() || path
    const content = await fileSystem.getFileContent(path)
    const buffer =
      typeof content === 'string' ? new TextEncoder().encode(content) : content
    const mimetype =
      args['--mimetype'] || mime.lookup(name) || 'application/octet-stream'
    const blob = new Blob([buffer], { type: mimetype })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'download'
  }
}
