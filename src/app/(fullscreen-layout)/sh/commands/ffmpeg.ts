import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'
import { getFFmpeg } from '../../to-gif/getFFmpeg'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class FFmpegCmd extends ShSimpleCallableCommand {
  override async execute() {
    const ffmpeg = getFFmpeg()
    await ffmpeg.exec(this.args)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'ffmpeg'
  }
}
