import { splitGraphemes } from './utils'

import { TERMINAL_INPUT_NAME_MAP } from '../constants'

import stringWidth from 'string-width'

import type { ShTerminal } from '../ShTerminal'

export function rawBackspace(vt: ShTerminal) {
  const commandStrArr = splitGraphemes(vt.command)
  const lastChar = commandStrArr[commandStrArr.length - 1]
  if (lastChar === undefined) {
    return
  }
  vt.command = commandStrArr.slice(0, commandStrArr.length - 1).join('')

  if (lastChar !== '\n') {
    vt.xterm.write('\b \b'.repeat(stringWidth(lastChar)))
  } else {
    if (vt.command.endsWith('\n')) {
      // 上移一行
      vt.xterm.write('\x1b[1A')
      return
    }
    // 这是新的（退格后）命令
    const lines = vt.command.split(/\r\n|\r|\n/g)
    // 新的最后一行的长度
    let offset = stringWidth(lines[lines.length - 1])
    if (lines.length <= 1) {
      offset += stringWidth(vt.prefix)
    }
    // 上移一行
    vt.xterm.write('\x1b[1A')
    // 向右移动到行尾
    vt.xterm.write(`\x1b[${offset}C`)
  }
}

export function backspace(e: string, vt: ShTerminal) {
  if (e !== TERMINAL_INPUT_NAME_MAP['backspace']) {
    return
  }

  rawBackspace(vt)
}

const SEP_CHARS = [
  '，',
  '。',
  '、',
  '；',
  '！',
  '？',
  '：',
  '“',
  '”',
  '‘',
  '’',
  '【',
  '】',
  '《',
  '》',
  '（',
  '）',
  ',',
  '.',
  ';',
  '!',
  '?',
  ':',
  '"',
  "'",
  '`',
  '“',
  '”',
  '/',
  '\\',
  '|',
  ' ',
  '\t',
  '\n',
  '\r',
  '\r\n',
]

function rawBackspaceWord(vt: ShTerminal) {
  let foreverSep = true
  const chars = splitGraphemes(vt.command)
  for (let i = chars.length - 1; i >= 0; i -= 1) {
    const char = chars[i]
    if (SEP_CHARS.includes(char)) {
      if (foreverSep) {
        rawBackspace(vt)
        continue
      }
      break
    }
    foreverSep = false
    rawBackspace(vt)
  }
}

export function backspaceWord(e: string, vt: ShTerminal) {
  if (
    e !== TERMINAL_INPUT_NAME_MAP['ctrl+backspace'] &&
    e !== TERMINAL_INPUT_NAME_MAP['alt+backspace']
  ) {
    return
  }
  rawBackspaceWord(vt)
}
