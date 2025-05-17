import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Mv extends ShSimpleCallableCommand {
  override async execute() {
    const [oldPath, newPath] = this.pathsRequired(this.args[0], this.args[1])
    await this.vt.fileSystem.move(oldPath, newPath)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'mv'
  }
}
