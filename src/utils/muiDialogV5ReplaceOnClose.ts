import { SilentError } from '@/errors/SilentError'

import { muiDialogV5 } from '@ebay/nice-modal-react'

import type { NiceModalHandler } from '@ebay/nice-modal-react'

export function muiDialogV5ReplaceOnClose(
  modal: NiceModalHandler
): ReturnType<typeof muiDialogV5> {
  return {
    ...muiDialogV5(modal),
    onClose() {
      modal.reject(new SilentError('操作已取消'))
      void modal.hide()
    },
  }
}
