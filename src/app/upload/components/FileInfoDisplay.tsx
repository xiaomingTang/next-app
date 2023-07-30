import { checkIsImage, useFileUrl } from '../utils/fileToDataUrl'

import { CustomLoadingButton } from '@/components/CustomLoadingButton'

import WarningIcon from '@mui/icons-material/Warning'
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import TextSnippetIcon from '@mui/icons-material/TextSnippet'
import {
  Stack,
  ListItem,
  IconButton,
  ButtonGroup,
  Button,
  Tooltip,
  Typography,
  Divider,
  ListItemAvatar,
  Avatar,
} from '@mui/material'
import { toast } from 'react-hot-toast'
import CopyToClipboard from 'react-copy-to-clipboard'

export interface FileInfo {
  file: File
  status: 'succeed' | 'failed' | 'pending' | 'before-upload'
  /**
   * 上传成功才有 key
   */
  key?: string
  /**
   * 上传成功才有 key
   */
  url?: string
  /**
   * 上传失败的原因
   */
  error?: string
}

export const uploadStatusMap: Record<
  FileInfo['status'],
  {
    title: string
    icon: React.ReactNode
  }
> = {
  'before-upload': {
    title: '待上传',
    icon: <UploadFileIcon color='info' />,
  },
  pending: {
    title: '上传中',
    icon: <HourglassBottomIcon color='disabled' />,
  },
  succeed: {
    title: '上传成功',
    icon: <CheckCircleIcon color='success' />,
  },
  failed: {
    title: '上传失败',
    icon: <WarningIcon color='error' />,
  },
}

function friendlySize(n: number) {
  if (n < 1024) {
    return `${n} b`
  }
  if (n < 1024 * 1024) {
    return `${(n / 1024).toFixed(0)} kb`
  }
  if (n < 1024 * 1024 * 1024) {
    return `${(n / 1024 / 1024).toFixed(1)} mb`
  }
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} gb`
}

export function FileInfoDisplay({
  onDelete,
  index,
  ...info
}: FileInfo & {
  index: number
  onDelete: () => Promise<void>
}) {
  const isImage = checkIsImage(info.file)
  const url = useFileUrl(info.file)
  return (
    <>
      {index !== 0 && (
        <Divider key={`divider-${index}`} variant='inset' component='li' />
      )}
      <ListItem
        alignItems='flex-start'
        sx={{ pr: '96px' }}
        secondaryAction={
          <>
            {info.status !== 'pending' && (
              <CustomLoadingButton
                aria-label='删除该文件'
                color='error'
                size='small'
                onClick={onDelete}
              >
                删除
              </CustomLoadingButton>
            )}
            {info.status === 'failed' ? (
              <Tooltip
                title={`${uploadStatusMap[info.status].title}: ${
                  info.error ?? ''
                }`}
              >
                <IconButton
                  edge='end'
                  aria-label={uploadStatusMap[info.status].title}
                >
                  {uploadStatusMap[info.status].icon}
                </IconButton>
              </Tooltip>
            ) : (
              <IconButton
                edge='end'
                aria-label={uploadStatusMap[info.status].title}
                disabled
              >
                {uploadStatusMap[info.status].icon}
              </IconButton>
            )}
          </>
        }
      >
        <ListItemAvatar>
          <Avatar
            variant='square'
            alt={info.file.name}
            src={isImage ? url : ''}
          >
            {!isImage && <TextSnippetIcon />}
          </Avatar>
        </ListItemAvatar>
        <Stack sx={{ flex: '1 1 auto', overflow: 'hidden' }}>
          <Typography
            noWrap
            color={info.status === 'failed' ? 'error' : undefined}
          >
            <Typography
              component='span'
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                mr: 1,
                fontSize: '0.875em',
              }}
            >
              [{friendlySize(info.file.size)}]
            </Typography>
            {info.file.name}
          </Typography>
          {info.url && (
            <ButtonGroup size='small' variant='outlined'>
              <CopyToClipboard
                text={info.url}
                onCopy={() => toast.success('复制成功')}
              >
                <Button>复制 url</Button>
              </CopyToClipboard>
              <CopyToClipboard
                text={`${isImage ? '!' : ''}[${info.file.name}](${info.url})`}
                onCopy={() => toast.success('复制成功')}
              >
                <Button>复制 markdown 格式</Button>
              </CopyToClipboard>
            </ButtonGroup>
          )}
        </Stack>
      </ListItem>
    </>
  )
}
