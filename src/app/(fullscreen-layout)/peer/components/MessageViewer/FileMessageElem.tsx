import { MessageWrapperWithRole } from './MessageWrapper'
import { TextMessageInnerElem } from './TextMessageElem'

import { usePeer } from '../../store/usePeer'

import Anchor from '@/components/Anchor'
import { useFile2URL } from '@/utils/file'
import { friendlySize } from '@/utils/transformer'

import { Typography } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'

import type { FileMessageIns } from '../../type'

export function FileMessageElem(message: FileMessageIns) {
  const { value: file, size, name, src } = message
  const dataUrl = useFile2URL(file)
  const { peerId } = usePeer()
  const role = src === peerId ? 'master' : 'guest'

  return (
    <MessageWrapperWithRole role={role} message={message}>
      <TextMessageInnerElem
        {...message}
        type='text'
        value={
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
