import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'
import { getFFmpeg } from '../../to-gif/getFFmpeg'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class FFmpegCmd extends ShSimpleCallableCommand {
  override async execute() {
    const ffmpeg = getFFmpeg()
    this.vt.addListener('terminated', this.onTerminated)
    await ffmpeg.exec(this.args).finally(() => {
      this.vt.removeListener('terminated', this.onTerminated)
    })
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'ffmpeg'
  }

  onTerminated = () => {
    const ffmpeg = getFFmpeg()
    ffmpeg.terminate()
    void ffmpeg.load()
  }
}
