import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'
import { editText } from '../components/TextEditor'

import type { ShSimpleCallableCommandOptions } from '../ShSimpleCallableCommand'
import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Vi extends ShSimpleCallableCommand {
  usage = 'vi [OPTION]... <file>'

  description = 'Open a file in the editor'

  options: ShSimpleCallableCommandOptions[] = [
    {
      shortName: 'h',
      longName: 'help',
      description: 'Show help message',
      type: 'boolean',
    },
  ]

  override async execute() {
    this.normalizeOptionsAndArgs({
      withSimpleHelp: true,
    })
    const { fileSystem } = this.vt
    const [path] = this.pathsRequired(this.args[0])
    const name = path.split('/').pop() || path
    const content = await fileSystem.getFileContent(path)
    await editText({
      title: `编辑文件 ${name}`,
      content:
        typeof content === 'string'
          ? content
          : new TextDecoder().decode(content),
      async onSave(newContent) {
        await fileSystem.writeFile(path, newContent)
        return newContent
      },
    })
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'vi'
  }
}
