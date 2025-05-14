import { Vi } from './vi'

import type { CallableCommandProps } from '../utils/command'

export class Vim extends Vi {
  constructor(props: CallableCommandProps) {
    super(props)
    this.name = 'vim'
  }
}
