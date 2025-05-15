import { ShCallableCommand } from './ShCallableCommand'

import { SilentError } from '@/errors/SilentError'

import type { ShCallableCommandProps } from './ShCallableCommand'

export type ShSimpleCallableCommandOptions = {
  shortName: string
  longName: string
  description: string
} & (
  | {
      /**
       * `--name=value` or `--name value`
       */
      type: 'string'
      value?: string
    }
  | {
      /**
       * `--name`
       */
      type: 'boolean'
      value?: true
    }
  | {
      /**
       * `--name=value` or `--name value`
       */
      type: 'number'
      value?: number
    }
)

function toNum(value: string) {
  const numValue = Number(value)
  if (Number.isNaN(numValue)) {
    throw new Error(`Invalid option: ${value}`)
  }
  return numValue
}

export class ShSimpleCallableCommand extends ShCallableCommand {
  options: ShSimpleCallableCommandOptions[] = []

  constructor(props: ShCallableCommandProps) {
    super(props)
  }

  /**
   * 从 args 中解析并填充 options, 及重置 args
   */
  normalizeOptionsAndArgs(config?: { withSimpleHelp?: boolean }) {
    const { args, options } = this
    const newArgs: string[] = []

    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i]
      const nextArg = args[i + 1]

      if (!arg.startsWith('-')) {
        // 非选项参数
        newArgs.push(arg)
        continue
      }

      const dashCount = arg.startsWith('--') ? 2 : (1 as const)
      const equalIndex = arg.indexOf('=')

      // Short option
      const name =
        equalIndex > -1
          ? arg.slice(dashCount, equalIndex)
          : arg.slice(dashCount)
      const optionKey = dashCount === 2 ? 'longName' : 'shortName'
      const option = options.find((o) => name === o[optionKey])
      if (!option) {
        throw new Error(`Invalid option: ${arg}`)
      }
      if (option.type === 'boolean') {
        option.value = true
        continue
      }
      if (equalIndex > -1) {
        // 处理 --name=value 的情况
        const value = arg.slice(equalIndex + 1)
        option.value = option.type === 'number' ? toNum(value) : value
        continue
      }
      if (!nextArg || nextArg.startsWith('-')) {
        // 暂不支持空字符串和负数
        throw new Error(`Invalid option: ${arg}`)
      }
      option.value = option.type === 'number' ? toNum(nextArg) : nextArg
      i += 1
      continue
    }

    const isHelp =
      config?.withSimpleHelp &&
      options.some(
        (option) => option.shortName === 'h' || option.longName === 'help'
      )
    if (!isHelp) {
      return this
    }
    if (this.usage) {
      this.terminal.log(this.usage)
    }
    if (this.description) {
      this.terminal.log(this.description)
    }
    const optionDescs = this.options.map((option) =>
      [
        option.shortName ? `-${option.shortName}, ` : '',
        option.longName ? `--${option.longName}` : '',
        option.description,
      ]
        .filter(Boolean)
        .join(' ')
    )
    this.terminal.log(optionDescs.join('\n'))
    this.terminal.log('\n')

    throw new SilentError('help finished')
  }
}
