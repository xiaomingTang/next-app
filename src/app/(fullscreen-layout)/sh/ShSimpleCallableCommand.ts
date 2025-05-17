import { ShCallableCommand } from './ShCallableCommand'
import { resolvePath } from './utils/path'

import type arg from 'arg'
import type { ShCallableCommandProps } from './ShCallableCommand'

export interface ArgConfig {
  [key: string]: {
    description: string
    spec: arg.Spec[string]
  }
}

type StringOrFalsy = string | undefined | void | null | false

export class ShSimpleCallableCommand extends ShCallableCommand {
  constructor(props: ShCallableCommandProps) {
    super(props)
  }

  pathsRequired(...args: [StringOrFalsy]): [string]
  pathsRequired(...args: [StringOrFalsy, StringOrFalsy]): [string, string]
  pathsRequired(
    ...args: [StringOrFalsy, StringOrFalsy, StringOrFalsy]
  ): [string, string, string]
  pathsRequired(
    ...args: [StringOrFalsy, StringOrFalsy, StringOrFalsy, StringOrFalsy]
  ): [string, string, string, string]
  pathsRequired(
    ...args: [
      StringOrFalsy,
      StringOrFalsy,
      StringOrFalsy,
      StringOrFalsy,
      StringOrFalsy,
    ]
  ): [string, string, string, string, string]
  pathsRequired<T extends StringOrFalsy[]>(...args: T): string[] {
    return args.map((arg, i) => {
      if (!arg) {
        throw new Error(`path ${i} is required`)
      }
      const trimedArg = arg.trim()
      if (!trimedArg) {
        throw new Error(`path ${i} is empty`)
      }
      return resolvePath(this.vt.fileSystem.context.path, trimedArg)
    })
  }
}
