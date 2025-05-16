import { sleepMs } from '@zimi/utils'

import type { Terminal } from '@xterm/xterm'

export class TerminalSpinner {
  n = 0

  fps = 10

  flags = ['\\', '|', '/', '-']

  lastFlagIndex = -1

  get loading() {
    return this.n > 0
  }

  loadingStartTime = 0

  start() {
    this.n += 1
    if (this.n === 1) {
      this.loadingStartTime = Date.now()
      void this.showLoadingUi()
    }
  }

  end() {
    this.n -= 1
    if (this.n <= 0) {
      this.n = 0
      this.lastFlagIndex = -1
      this.loadingStartTime = 0
      this.xterm.write('\b \b')
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
    const index = Math.floor((diff / 1000) * this.fps) % this.flags.length
    if (index === this.lastFlagIndex) {
      await this.showLoadingUi()
      return
    }
    this.lastFlagIndex = index
    const loadingFlagStr = this.flags[index]
    if (this.lastFlagIndex < 0) {
      this.xterm.write(loadingFlagStr)
    } else {
      this.xterm.write(`\b${loadingFlagStr}`)
    }
    await this.showLoadingUi()
  }
}
