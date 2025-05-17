import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import { pickFiles } from '@/utils/file'
import { useGlobalFileCatcherHandler } from '@/layout/components/useGlobalFileCatcherHandler'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Upload extends ShSimpleCallableCommand {
  override async execute() {
    const files = await pickFiles()
    await useGlobalFileCatcherHandler.getState().handler(files)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'upload'
  }
}
