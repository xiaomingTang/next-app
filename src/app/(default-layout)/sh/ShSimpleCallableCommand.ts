import { ShCallableCommand } from './ShCallableCommand'
import { parseOptions } from './utils/command'

import { SilentError } from '@/errors/SilentError'

import type { ParsedCommandLineOption } from './utils/command'
import type { ShCallableCommandProps } from './ShCallableCommand'

interface OptionConfig {
  shortName: string
  longName: string
  description: string
}

export interface ShSimpleCallableCommandOption extends OptionConfig {
  value?: string | true
}

export interface ShSimpleCallableCommandOptions {
  shortName: string
  longName: string
  description: string
  value: string | true
}

export class ShSimpleCallableCommand extends ShCallableCommand {
  options: ShSimpleCallableCommandOption[] = []

  constructor(props: ShCallableCommandProps) {
    super(props)
  }

  /**
   * 校验 options 合法性
   */
  normalizeOptions(config?: {
    withValidate?: boolean
    withSimpleHelp?: boolean
  }) {
    const parsed = parseOptions(this.args)
    const hasOption = (option: ParsedCommandLineOption) =>
      this.options.some(
        (o) =>
          o.shortName === option.shortName || o.longName === option.longName
      )
    const validOptions = parsed.options.filter((option) => hasOption(option))
    const invalidOptions = parsed.options.filter((option) => !hasOption(option))

    const res = {
      ...parsed,
      invalidOptions,
      validOptions,
    }

    const withSimpleHelp = config?.withSimpleHelp ?? false
    const withValidate = config?.withValidate ?? false

    if (withValidate && invalidOptions.length > 0) {
      const invalidNames = invalidOptions.map((option) =>
        option.shortName ? `-${option.shortName}` : `--${option.longName}`
      )
      throw new Error(
        `invalid option: ${invalidNames.join(', ')}.${!withSimpleHelp ? '' : `\n Try '${this.name} --help' for more information.`}`
      )
    }

    if (!withSimpleHelp) {
      return res
    }

    const isHelp = parsed.options.some(
      (option) => option.shortName === 'h' || option.longName === 'help'
    )
    if (!isHelp) {
      return res
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
