import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'
import { linkAddon } from '../utils/link'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Help extends ShSimpleCallableCommand {
  override async execute() {
    const msg = [
      'Available commands:',
      '- echo: Print the message to the terminal',
      '- cd: Change the current directory',
      '- clear: Clear the terminal screen',
      '- cp: Copy a file or directory',
      '- download: Download a file from the terminal',
      '- pwd: Print the current working directory',
      '- cat: Print the content of a file to the terminal',
      '- mkdir: Create a new directory',
      '- mv: Move or rename a file or directory',
      '- touch: Create a new file',
      '- upload: Upload files to local',
      '- rm: Remove a file or empty directory',
      '- ls: List files and directories in the current directory',
      '- vi/vim/edit: edit a file',
      '- help: Display this help information',
      '',
      `- ffmpeg: ${linkAddon.link('查看文档', 'https://ffmpeg.org/documentation.html')}`,
    ].join('\r\n')
    this.vt.log(msg)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'help'
  }
}
