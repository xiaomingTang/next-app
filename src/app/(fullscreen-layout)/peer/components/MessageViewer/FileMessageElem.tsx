import { MessageWrapperWithRole } from './MessageWrapper'
import { TextMessageInnerElem } from './TextMessageElem'

import { usePeer } from '../../store/usePeer'

import Anchor from '@/components/Anchor'

import { extension } from 'mime-types'
import { Typography } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'

import type { FileMessageIns } from '../../type'

export function FileMessageElem(message: FileMessageIns) {
  const { value: fileSrc, src, id } = message
  const { peerId } = usePeer()
  const role = src === peerId ? 'master' : 'guest'
  // fileSrc: data:image/jpeg;base64
  const extRegResult = /^data:(\w+\/\w+)/i.exec(fileSrc)
  const extDesc = extRegResult?.[1] ?? 'unknown/unknown'
  const ext = extension(extDesc)

  return (
    <MessageWrapperWithRole role={role} message={message}>
      <TextMessageInnerElem
        {...message}
        type='text'
        value={
          <Anchor
            download={`${id}.${ext}`}
            href={fileSrc}
            style={{ color: 'inherit', display: 'block' }}
          >
            <Typography
              component='div'
              sx={{
                whiteSpace: 'nowrap',
                // padding: 0; 是为了避免 Anchor 下的尺寸塌陷
                padding: '0',
              }}
            >
              点击下载 <FileDownloadIcon />
            </Typography>
          </Anchor>
        }
      />
    </MessageWrapperWithRole>
  )
}
