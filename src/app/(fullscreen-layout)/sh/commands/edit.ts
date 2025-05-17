import { Vi } from './vi'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Edit extends Vi {
  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'edit'
  }
}
