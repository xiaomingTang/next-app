import type { ShTerminal } from '../ShTerminal'

const s20 = String.fromCharCode(0x20)
const s7e = String.fromCharCode(0x7e)
const sa0 = String.fromCharCode(0x00a0)

function isVisibleChar(e: string): boolean {
  const res = (e >= s20 && e <= s7e) || e >= sa0
  return res
}

/**
 * 普通文本写入
 */
export function textInput(e: string, vt: ShTerminal) {
  const firstChar = e.charAt(0)
  if (!isVisibleChar(e) && firstChar !== '\r' && firstChar !== '\n') {
    return
  }
  const { xterm } = vt
  const lines = e.split(/\r\n|\r|\n/g)
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]

    if (i === 0) {
      xterm.write(line)
      vt.command += line
    } else {
      xterm.write(`\r\n${line}`)
      vt.command += `\n${line}`
    }
  }
}
