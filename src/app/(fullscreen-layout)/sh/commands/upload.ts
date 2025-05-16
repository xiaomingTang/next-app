import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import { pickFiles } from '@/utils/file'
import { useGlobalFileCatcherHandler } from '@/layout/components/useGlobalFileCatcherHandler'

import type { ShSimpleCallableCommandOptions } from '../ShSimpleCallableCommand'
import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Upload extends ShSimpleCallableCommand {
  usage = 'upload (后面不需要接其他参数)'

  description = '载入文件到系统中。小提示：也可以直接拖拽文件到页面中'

  options: ShSimpleCallableCommandOptions[] = [
    {
      shortName: 'h',
      longName: 'help',
      description: 'show this help message and exit',
      type: 'boolean',
    },
  ]

  override async execute() {
    this.normalizeOptionsAndArgs({
      withSimpleHelp: true,
    })
    const files = await pickFiles()
    await useGlobalFileCatcherHandler.getState().handler(files)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'upload'
  }
}
