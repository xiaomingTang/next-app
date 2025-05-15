import type { ShTerminal } from './ShTerminal'

export interface ShCallableCommandProps {
  /**
   * 原始命令字符串
   */
  raw: string
  name: string
  args: string[]
  env: Record<string, string>
  terminal: ShTerminal
}

export class ShCallableCommand implements ShCallableCommandProps {
  raw: string

  name: string

  args: string[]

  env: Record<string, string>

  terminal: ShTerminal

  async execute() {
    // This method should be overridden by subclasses
    throw new Error('execute() method not implemented')
  }

  constructor(props: ShCallableCommandProps) {
    this.raw = props.raw
    this.name = props.name
    this.args = props.args
    this.env = props.env
    this.terminal = props.terminal
  }
}

export type ShCallableCommandConstructor = new (
  _: ShCallableCommandProps
) => ShCallableCommand
