import type { ShTerminal } from '../ShTerminal'

export interface ParsedCommandLine {
  name: string
  args: string[]
  env: Record<string, string>
}

export function parseCommand(input: string): ParsedCommandLine {
  const env: Record<string, string> = {}
  const args: string[] = []

  let current = ''
  let inSingleQuote = false
  let inDoubleQuote = false
  let escaping = false

  const flush = () => {
    if (current.length > 0) {
      args.push(current)
      current = ''
    }
  }

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (escaping) {
      current += char
      escaping = false
      continue
    }

    if (char === '\\') {
      escaping = true
      continue
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote
      continue
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote
      continue
    }

    if (/\s/.test(char) && !inSingleQuote && !inDoubleQuote) {
      flush()
      continue
    }

    current += char
  }

  if (escaping || inSingleQuote || inDoubleQuote) {
    throw new Error('Unclosed quote or unfinished escape in command')
  }

  flush()

  // Separate env assignments and actual command
  const realArgs: string[] = []
  for (const arg of args) {
    const equalIndex = arg.indexOf('=')
    if (
      realArgs.length === 0 && // only at the beginning
      equalIndex > 0 &&
      /^[A-Za-z_][A-Za-z0-9_]*$/.test(arg.slice(0, equalIndex)) // valid env var name
    ) {
      const key = arg.slice(0, equalIndex)
      const value = arg.slice(equalIndex + 1)
      env[key] = value
    } else {
      realArgs.push(arg)
    }
  }

  if (realArgs.length === 0) {
    throw new Error('No command found')
  }

  const name = realArgs[0]
  const finalArgs = realArgs.slice(1)

  return { name, args: finalArgs, env }
}

export interface CallableCommandProps {
  name: string
  args: string[]
  env: Record<string, string>
  terminal: ShTerminal
}

export class CallableCommand implements CallableCommandProps {
  name: string

  args: string[]

  env: Record<string, string>

  terminal: ShTerminal

  async execute() {
    // This method should be overridden by subclasses
    throw new Error('execute() method not implemented')
  }

  constructor(props: CallableCommandProps) {
    this.name = props.name
    this.args = props.args
    this.env = props.env
    this.terminal = props.terminal
  }
}

export type CallableCommandConstructor = new (
  _: CallableCommandProps
) => CallableCommand
