import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import mime from 'mime-types'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Download extends ShSimpleCallableCommand {
  usage = 'download <file>'

  description = 'Download a file from the terminal'

  override async execute() {
    this.normalizeOptionsAndArgs({
      withSimpleHelp: true,
    })
    const { vt } = this
    const { fileSystem } = vt
    const [path] = this.pathsRequired(this.args[0])
    const name = path.split('/').pop() || path
    const content = await fileSystem.getFileContent(path)
    const buffer =
      typeof content === 'string' ? new TextEncoder().encode(content) : content
    // TODO: 支持参数传入 mimetype
    const mimetype = mime.lookup(name) || 'application/octet-stream'
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
