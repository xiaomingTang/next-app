import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Pwd extends ShSimpleCallableCommand {
  override async execute() {
    const { fileSystem } = this.vt
    this.vt.log(fileSystem.context.path)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'pwd'
  }
}
