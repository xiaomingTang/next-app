import { InfiniteTimeout } from '@/constants'

import { sleepMs } from '@zimi/utils'
import stringWidth from 'string-width'
import { clamp } from 'lodash-es'

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
      this.xterm.write(' \b'.repeat(w))
    }
  }

  withLoading<Arg extends unknown[], Res>(
    fn: (...args: Arg) => Res | Promise<Res>,
    delayMs = 300
  ) {
    return async (...args: Arg) => {
      let timer = -1
      if (delayMs > 0) {
        timer = +setTimeout(
          () => {
            timer = -1
            this.start()
          },
          clamp(delayMs, 0, InfiniteTimeout)
        )
      } else {
        this.start()
      }
      try {
        return await fn(...args)
      } finally {
        if (timer < 0) {
          this.end()
        } else {
          clearTimeout(timer)
          timer = -1
        }
      }
    }
  }

  async runWithLoading<Res>(fn: () => Res | Promise<Res>, delayMs = 300) {
    return await this.withLoading(fn, delayMs)()
  }

  xterm: Terminal

  constructor(xterm: Terminal) {
    this.xterm = xterm
  }

  async showLoadingUi() {
    if (this.n <= 0) {
      return
    }
    const diff = Date.now() - this.loadingStartTime
    const curIndex = Math.floor((diff / 1000) * this.fps) % this.flags.length
    if (curIndex !== this.lastFlagIndex) {
      const curFlagStr = this.flags[curIndex]
      const w = stringWidth(curFlagStr ?? '')
      this.xterm.write(`${curFlagStr}${'\b'.repeat(w)}`)
      this.lastFlagIndex = curIndex
    }
    await sleepMs(20)
    await this.showLoadingUi()
  }
}
