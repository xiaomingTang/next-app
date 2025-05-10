import type { Dispatch, SetStateAction } from 'react'

export interface ExitableProps {
  exited: boolean
  onExited: Dispatch<SetStateAction<boolean>>
}
