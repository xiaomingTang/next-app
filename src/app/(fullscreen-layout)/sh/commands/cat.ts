import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShSimpleCallableCommandOptions } from '../ShSimpleCallableCommand'
import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Cat extends ShSimpleCallableCommand {
  usage = 'cat [OPTION]... <file>'

  description = 'Print the content of a file to the terminal'

  options: ShSimpleCallableCommandOptions[] = [
    {
      shortName: 'h',
      longName: 'help',
      description: 'Show help message',
      type: 'boolean',
    },
    {
      shortName: '',
      longName: 'encoding',
      description: 'Specify the encoding of the file',
      type: 'string',
    },
  ]

  override async execute() {
    this.normalizeOptionsAndArgs({
      withSimpleHelp: true,
    })
    const { vt } = this
    const { fileSystem } = vt
    const [path] = this.pathsRequired(this.args[0])
    // TODO: 传入 encoding
    // const encoding = this.options.find(
    //   (option) => option.longName === 'encoding'
    // )
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
