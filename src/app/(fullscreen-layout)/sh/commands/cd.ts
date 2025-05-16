import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Cd extends ShSimpleCallableCommand {
  override async execute() {
    const { fileSystem } = this.vt
    const [path] = this.pathsRequired(this.args[0])
    fileSystem.context = await fileSystem.getDirOrThrow(path)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'cd'
  }
}
