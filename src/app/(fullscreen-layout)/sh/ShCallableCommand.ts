import type { ShTerminal } from './ShTerminal'

export interface ShCallableCommandProps {
  /**
   * 原始命令字符串
   */
  rawCommand: string
  name: string
  args: string[]
  env: Record<string, string>
  vt: ShTerminal
}

export class ShCallableCommand implements ShCallableCommandProps {
  /**
   * 用法描述（如 `usage: ls [OPTION]... [FILE]`）
   */
  usage = ''

  /**
   * 命令描述（如 `List information about the FILEs`）
   */
  description = ''

  rawCommand: string

  name: string

  args: string[]

  env: Record<string, string>

  vt: ShTerminal

  async execute() {
    // This method should be overridden by subclasses
    throw new Error('execute() method not implemented')
  }

  constructor(props: ShCallableCommandProps) {
    this.rawCommand = props.rawCommand
    this.name = props.name
    this.args = props.args
    this.env = props.env
    this.vt = props.vt
  }
}

export type ShCallableCommandConstructor = new (
  _: ShCallableCommandProps
) => ShCallableCommand
