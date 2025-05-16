import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Ls extends ShSimpleCallableCommand {
  override async execute() {
    const { fileSystem } = this.vt
    const [path] = this.pathsRequired(this.args[0] || '.')
    const children = await fileSystem.listDir(path)
    this.vt.log(...children)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'ls'
  }
}
