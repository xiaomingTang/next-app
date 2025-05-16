import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'
import { linkAddon } from '../utils/link'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Help extends ShSimpleCallableCommand {
  override async execute() {
    const msg = [
      'Available commands:',
      '- echo',
      '- cd',
      '- clear',
      '- cp: 支持 -r 递归复制',
      '- pwd',
      '- cat',
      '- mkdir: 支持 -r 递归创建',
      '- mv',
      '- touch',
      '- rm: 支持 -r 递归删除',
      '- ls',
      '- vi/vim/edit: 编辑文件',
      '- help',
      '',
      '- download: 文件下载',
      '- upload: 加载文件到终端当前目录',
      `- ffmpeg: ${linkAddon.link('查看文档', 'https://ffmpeg.org/documentation.html')}`,
    ].join('\r\n')
    this.vt.log(msg)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'help'
  }
}
