import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShSimpleCallableCommandOptions } from '../ShSimpleCallableCommand'
import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Rm extends ShSimpleCallableCommand {
  usage = 'rm [OPTION]... <path>'

  description = 'Remove a file or directory'

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
    const [fRes, dRes] = await Promise.allSettled([
      fileSystem.getFileOrThrow(this.args[0]),
      fileSystem.getDirOrThrow(this.args[0]),
    ])
    if (fRes.status === 'rejected' && dRes.status === 'rejected') {
      this.vt.log(`No such file or directory: ${this.args[0]}`)
      return
    }
    if (fRes.status === 'fulfilled') {
      await fileSystem.deleteAsset(fRes.value)
      this.vt.log(`Removed: ${fRes.value.path}`)
    }
    if (dRes.status === 'fulfilled') {
      await fileSystem.deleteAsset(dRes.value)
      this.vt.log(`Removed: ${dRes.value.path}/`)
    }
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'rm'
  }
}
