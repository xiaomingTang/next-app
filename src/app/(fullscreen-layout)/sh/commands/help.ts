import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'
import { ansi, linkAddon } from '../utils/link'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Help extends ShSimpleCallableCommand {
  override async execute() {
    const msg = [
      'Available commands:',
      '- cat',
      '- cd',
      '- clear',
      '- cp: 支持 -r 递归复制',
      '- echo',
      '- help',
      '- ls',
      '- mkdir: 支持 -r 递归创建',
      '- mv',
      '- pwd',
      '- rm: 支持 -r 递归删除',
      '- touch',
      '- edit/vi/vim: 编辑文件',
      '',
      '- download: 文件下载',
      '- upload: 加载文件到终端当前目录',
      `- ffmpeg: ${linkAddon.link('查看文档', 'https://ffmpeg.org/documentation.html')}`,
      `  需要注意，由于 ffmpeg 命令的所有参数全部都交给 ffmpeg 处理，`,
      `  所以在使用 ${ansi.yellowBright('ffmpeg 命令')}时，路径需要使用${ansi.yellowBright('绝对路径')}，`,
      `  否则会出现找不到文件的错误。`,
    ].join('\r\n')
    this.vt.log(msg)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'help'
  }
}
