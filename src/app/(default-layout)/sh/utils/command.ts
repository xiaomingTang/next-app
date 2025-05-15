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

export interface ParsedCommandLineOption {
  shortName: string
  longName: string
  value: string | true
}

export interface ParsedCommandLineArgsAndOptions {
  args: string[]
  options: ParsedCommandLineOption[]
}

/**
 * - input: `-a -b 111 --c --d -e --f=222 ---g 333 --h
 * - result options: [
 *  { shortName: 'a', longName: '', value: true },
 *  { shortName: 'b', longName: '', value: '111' },
 *  { shortName: '', longName: 'c', value: true },
 *  { shortName: '', longName: 'd', value: true },
 *  { shortName: 'e', longName: '', value: true },
 *  { shortName: '', longName: 'f', value: '222' },
 *  { shortName: '', longName: '-g', value: '333' },
 *  { shortName: '', longName: 'h', value: true },
 * ]
 */
export function parseOptions(args: string[]): ParsedCommandLineArgsAndOptions {
  const parsed: ParsedCommandLineArgsAndOptions = {
    args: [],
    options: [],
  }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    // Short option
    const nextArg = args[i + 1]

    if (arg.startsWith('--')) {
      // Long option
      const equalIndex = arg.indexOf('=')
      if (equalIndex > 0) {
        const longName = arg.slice(2, equalIndex)
        const value = arg.slice(equalIndex + 1)
        parsed.options.push({ shortName: '', longName, value })
      } else {
        const longName = arg.slice(2)
        if (nextArg && !nextArg.startsWith('-')) {
          parsed.options.push({ shortName: '', longName, value: nextArg })
          i += 1 // Skip the next argument
        } else {
          parsed.options.push({ shortName: '', longName, value: true })
        }
      }
    } else if (arg.startsWith('-')) {
      if (nextArg && !nextArg.startsWith('-')) {
        parsed.options.push({
          shortName: arg.slice(1),
          longName: '',
          value: nextArg,
        })
        i += 1 // Skip the next argument
      } else {
        parsed.options.push({
          shortName: arg.slice(1),
          longName: '',
          value: true,
        })
      }
    } else {
      // Regular argument
      parsed.args.push(arg)
    }
  }
  return parsed
}
