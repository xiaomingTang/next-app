import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Cat extends ShSimpleCallableCommand {
  override async execute() {
    const { vt } = this
    const { fileSystem } = vt
    const [path] = this.pathsRequired(this.args[0])
    const content = await fileSystem.getFileContent(path)
    vt.debug('cat content: ', content)
    if (typeof content === 'string') {
      vt.log(content)
    } else {
      const uint8 = new Uint8Array(content)
      vt.log(new TextDecoder().decode(uint8))
    }
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'cat'
  }
}
