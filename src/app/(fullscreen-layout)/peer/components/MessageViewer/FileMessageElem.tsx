import { MessageWrapperWithRole } from './MessageWrapper'
import { TextMessageInnerElem } from './TextMessageElem'

import { usePeer } from '../../store/usePeer'

import Anchor from '@/components/Anchor'
import { file2DataURL } from '@/app/(default-layout)/color/utils'

import { Typography } from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import useSWR from 'swr'

import type { FileMessageIns } from '../../type'

export function FileMessageElem(message: FileMessageIns) {
  const { value: file, contentType, size, name, src } = message
  const { data: dataUrl } = useSWR(`${name}-${size}-${contentType}`, () =>
    file2DataURL(file)
  )
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
              [文件] {name} {dataUrl ? <FileDownloadIcon /> : '...'}
            </Typography>
          </Anchor>
        }
      />
    </MessageWrapperWithRole>
  )
}
