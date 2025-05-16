import { Ls } from './ls'
import { Cd } from './cd'
import { Pwd } from './pwd'
import { Cat } from './cat'
import { Mkdir } from './mkdir'
import { Touch } from './touch'
import { Echo } from './echo'
import { Rm } from './rm'
import { Vi } from './vi'
import { Vim } from './vim'
import { Edit } from './edit'
import { Help } from './help'
import { FFmpegCmd } from './ffmpeg'
import { Clear } from './clear'
import { Upload } from './upload'
import { Mv } from './mv'
import { Cp } from './cp'
import { Download } from './download'

import type { ShCallableCommand } from '../ShCallableCommand'

export const commands: [string, typeof ShCallableCommand][] = [
  ['cat', Cat],
  ['cd', Cd],
  ['clear', Clear],
  ['cp', Cp],
  ['download', Download],
  ['echo', Echo],
  ['help', Help],
  ['edit', Edit],
  ['ffmpeg', FFmpegCmd],
  ['ls', Ls],
  ['mkdir', Mkdir],
  ['mv', Mv],
  ['pwd', Pwd],
  ['rm', Rm],
  ['touch', Touch],
  ['upload', Upload],
  ['vi', Vi],
  ['vim', Vim],
]
