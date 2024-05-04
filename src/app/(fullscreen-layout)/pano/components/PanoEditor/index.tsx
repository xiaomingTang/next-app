import { PanoCameraStatus } from './PanoCameraStatus'
import { PanoEditorContextMenu } from './PanoEditorContextMenu'

import { PANO_EDIT_MODE } from '../constants'

export function PanoEditor() {
  if (!PANO_EDIT_MODE) {
    return <></>
  }
  return (
    <>
      <PanoCameraStatus />
      <PanoEditorContextMenu />
    </>
  )
}
