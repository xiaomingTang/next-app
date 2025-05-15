import { Vi } from './vi'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Vim extends Vi {
  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'vim'
  }
}
