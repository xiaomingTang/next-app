import Stackedit from 'stackedit-js'

import type { BuiltInEvents, OpenFileProps } from 'stackedit-js'

export async function editMarkdown(editProps: OpenFileProps): Promise<string> {
  return new Promise((resolve) => {
    const stackedit = new Stackedit()
    stackedit.openFile(editProps)

    let finalText = ''

    const onFileChange = (e: BuiltInEvents['fileChange']) => {
      finalText = e.content.text
    }

    const onClose = () => {
      resolve(finalText)
      stackedit.off('close', onClose)
      stackedit.off('fileChange', onFileChange)
    }

    stackedit.on('fileChange', onFileChange)
    stackedit.on('close', onClose)
  })
}
