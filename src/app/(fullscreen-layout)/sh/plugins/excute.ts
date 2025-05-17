import { parseCommand } from '../utils/command'

import { SilentError } from '@/errors/SilentError'
import { toError } from '@/errors/utils'

import type { ShTerminal } from '../ShTerminal'

export async function excute(e: string, vt: ShTerminal) {
  if (e !== '\r') {
    return
  }
  const cmd = vt.command.trim()
  if (!cmd) {
    vt.prompt()
    return
  }
  vt.debug('execute: ', cmd)
  const { name, args, env, errors } = parseCommand(cmd)
  vt.debug('parsed: ', { name, args, env, errors })
  if (errors.length > 0) {
    vt.xterm.write(errors.join('\r\n'))
    vt.prompt()
    return
  }
  const CommandClass = vt.commands[name]
  // 判断 !name 是为了防止有命令就叫 `undefined`
  if (!name || !CommandClass) {
    vt.xterm.write(`Command not found: ${name}`)
    vt.prompt()
    return
  }
  // TODO: 实现 pipe
  const commandInstance = new CommandClass({
    rawCommand: cmd,
    name,
    args,
    env,
    vt,
  })
  vt.spinner.start()
  await commandInstance
    .execute()
    .then(() => {
      vt.spinner.end()
    })
    .catch((err) => {
      vt.spinner.end()
      const error = toError(err)
      if (SilentError.isSilentError(error)) {
        return
      }
      vt.xterm.write(error.message)
    })
    .finally(() => {
      vt.prompt()
    })
}
