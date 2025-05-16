import { sleepMs } from '@zimi/utils'
import stringWidth from 'string-width'

import type { Terminal } from '@xterm/xterm'

export class TerminalSpinner {
  n = 0

  fps = 10

  flags = [
    '\\',
    '|',
    '/.',
    '-.',
    '\\..',
    '|..',
    '/...',
    '-...',
    '\\..',
    '|..',
    '/.',
    '-.',
  ]

  lastFlagIndex = -1

  get loading() {
    return this.n > 0
  }

  loadingStartTime = 0

  start() {
    this.n += 1
    if (this.n === 1) {
      this.lastFlagIndex = -1
      this.loadingStartTime = Date.now()
      void this.showLoadingUi()
    }
  }

  end() {
    this.n -= 1
    if (this.n <= 0) {
      this.n = 0
      this.loadingStartTime = 0
      const w = stringWidth(this.flags[this.lastFlagIndex] ?? '')
      this.xterm.write('\b \b'.repeat(w))
    }
  }

  async withLoading(fn: () => Promise<void> | void) {
    this.start()
    try {
      await fn()
    } finally {
      this.end()
    }
  }

  xterm: Terminal

  constructor(xterm: Terminal) {
    this.xterm = xterm
  }

  async showLoadingUi() {
    await sleepMs(20)
    if (this.n <= 0) {
      return
    }
    const diff = Date.now() - this.loadingStartTime
    const curIndex = Math.floor((diff / 1000) * this.fps) % this.flags.length
    if (curIndex === this.lastFlagIndex) {
      await this.showLoadingUi()
      return
    }
    const curFlagStr = this.flags[curIndex]
    const w = stringWidth(this.flags[this.lastFlagIndex] ?? '')
    this.xterm.write(`${'\b \b'.repeat(w)}${curFlagStr}`)
    this.lastFlagIndex = curIndex
    await this.showLoadingUi()
  }
}
