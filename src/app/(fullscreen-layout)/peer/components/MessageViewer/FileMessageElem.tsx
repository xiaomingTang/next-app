import { MessageWrapperWithRole } from './MessageWrapper'
import { TextMessageInnerElem } from './TextMessageElem'

import { usePeer } from '../../store'

import Anchor from '@/components/Anchor'
import { useFile2URL } from '@/utils/file'
import { friendlySize } from '@/utils/transformer'

import { Typography } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'

import type { FileMessage } from '../../type'

export function FileMessageElem(message: FileMessage) {
  const { payload: file, from: src } = message
  const { name, size } = file
  const dataUrl = useFile2URL(file)
  const peerId = usePeer((state) => state.peer?.id)
  const role = src === peerId ? 'master' : 'guest'

  return (
    <MessageWrapperWithRole role={role} message={message}>
      <TextMessageInnerElem
        {...message}
        type='text'
        payload={
          <Anchor
            download={name}
            href={dataUrl}
            style={{ color: 'inherit', display: 'block' }}
            underline={!!dataUrl}
          >
            <Typography
              component='div'
              sx={{
                whiteSpace: 'nowrap',
                // padding: 0; 是为了避免 Anchor 下的尺寸塌陷
                padding: '0',
              }}
            >
              [文件 {friendlySize(size)}] {name}{' '}
              {dataUrl ? <FileDownloadIcon /> : '...'}
            </Typography>
          </Anchor>
        }
      />
    </MessageWrapperWithRole>
  )
}
