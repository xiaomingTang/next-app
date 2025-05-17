import { TERMINAL_INPUT_NAME_MAP } from '../constants'

import type { ShTerminal } from '../ShTerminal'

export function terminate(e: string, vt: ShTerminal) {
  if (e !== TERMINAL_INPUT_NAME_MAP['ctrl+c']) {
    return
  }
  vt.emit('terminated')
  vt.xterm.write('^C')
  vt.prompt()
}
