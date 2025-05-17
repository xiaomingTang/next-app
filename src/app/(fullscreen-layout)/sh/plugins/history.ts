import { rawBackspace } from './backspace'
import { splitGraphemes } from './utils'

import { TERMINAL_INPUT_NAME_MAP } from '../ffmpeg/constants'

import type { ShTerminal } from '../ShTerminal'

const HISTORY_MAX_LENGTH = 100
const stack: string[] = []
let activeIndex = 0

export function history(e: string, vt: ShTerminal) {
  // 不处理多行的情况
  if (vt.command.includes('\n')) {
    return
  }
  const isNotEmyty = !!vt.command.trim()
  switch (e) {
    case '\r':
      if (vt.command !== stack[stack.length - 1] && isNotEmyty) {
        if (stack.length >= HISTORY_MAX_LENGTH) {
          stack.shift()
        }
        stack.push(vt.command)
      }
      activeIndex = stack.length
      return
    case TERMINAL_INPUT_NAME_MAP['arrowup']:
      if (activeIndex === stack.length && isNotEmyty) {
        if (stack.length >= HISTORY_MAX_LENGTH) {
          stack.shift()
        }
        stack.push(vt.command)
      }
      activeIndex = Math.max(activeIndex - 1, 0)
      break
    case TERMINAL_INPUT_NAME_MAP['arrowdown']:
      activeIndex = Math.min(activeIndex + 1, stack.length)
      break
    default:
      return
  }
  const curCommandArr = splitGraphemes(vt.command)
  curCommandArr.forEach(() => {
    rawBackspace(vt)
  })
  const nextCommand = stack[activeIndex] || ''
  vt.command = nextCommand
  vt.xterm.write(nextCommand)
}
