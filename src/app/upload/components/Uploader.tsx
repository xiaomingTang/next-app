'use client'

import { deleteFile, uploadFiles } from '../server'

import { SA, toPlainError } from '@/errors/utils'
import { cat } from '@/errors/catchAndToast'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'

import WarningIcon from '@mui/icons-material/Warning'
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  FormHelperText,
  Stack,
  List,
  ListItem,
  ListItemText,
  IconButton,
  ButtonGroup,
  Button,
  Collapse,
  ListItemButton,
  Tooltip,
  Typography,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useCallback, useMemo, useState } from 'react'
import { omit } from 'lodash-es'
import { toast } from 'react-hot-toast'
import CopyToClipboard from 'react-copy-to-clipboard'

interface FileInfo {
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

function geneKey({ file }: FileInfo) {
  return `${file.name} - ${file.size} - ${file.type} - ${file.lastModified}`
}

const uploadStatusMap: Record<
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
  succeed: {
    title: '上传成功',
    icon: <CheckCircleIcon color='success' />,
  },
  failed: {
    title: '上传失败',
    icon: <WarningIcon color='error' />,
  },
  pending: {
    title: '上传中',
    icon: <HourglassBottomIcon color='disabled' />,
  },
}

// TODO: 做成弹窗形式 & 简易上传弹窗 & 全屏/轻量/单个文件上传 等
export function Uploader() {
  const [open, setOpen] = useState(false)
  const { handleSubmit, control } = useForm<{
    private: boolean
    randomFilenameByServer: boolean
    dirname: string
  }>({
    defaultValues: {
      private: false,
      randomFilenameByServer: true,
      dirname: '',
    },
  })
  const [fileInfoMap, setFileInfoMap] = useState({} as Record<string, FileInfo>)
  const fileInfos = useMemo(() => Object.values(fileInfoMap), [fileInfoMap])
  const updateFileInfos = useCallback(
    (newFileInfos: FileInfo[], override = true) => {
      const newFileInfoTuple = newFileInfos.map(
        (info) => [geneKey(info), info] as [string, FileInfo]
      )
      if (override) {
        setFileInfoMap((prev) => ({
          ...prev,
          ...Object.fromEntries(newFileInfoTuple),
        }))
      } else {
        setFileInfoMap((prev) => ({
          ...Object.fromEntries(newFileInfoTuple),
          ...prev,
        }))
      }
    },
    []
  )

  const onSubmit = useMemo(
    () =>
      handleSubmit(
        cat(async (e) => {
          const formData = new FormData()
          formData.append('config', JSON.stringify(e))
          const files = fileInfos
            .filter(
              (info) =>
                info.status === 'before-upload' || info.status === 'failed'
            )
            .map((info) => info.file)
          if (files.length === 0) {
            toast.success('所有文件都已上传成功')
          }
          files.forEach((f) => {
            formData.append('files', f)
          })
          updateFileInfos(
            files.map((f) => ({
              file: f,
              status: 'pending',
            }))
          )
          try {
            const res = await uploadFiles(formData).then(SA.decode)
            updateFileInfos(
              files.map((f, i) => {
                const resItem = res[i]
                return {
                  file: f,
                  status: resItem.status === 'fulfilled' ? 'succeed' : 'failed',
                  key:
                    resItem.status === 'fulfilled'
                      ? resItem.value.key
                      : undefined,
                  url:
                    resItem.status === 'fulfilled'
                      ? resItem.value.url
                      : undefined,
                  error:
                    resItem.status === 'rejected'
                      ? toPlainError(resItem.reason).message
                      : undefined,
                }
              })
            )
          } catch (err) {
            updateFileInfos(
              files.map((f) => ({
                file: f,
                status: 'failed',
              }))
            )
          }
        })
      ),
    [fileInfos, handleSubmit, updateFileInfos]
  )

  const dirnameElem = (
    <Controller
      name='dirname'
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          size='small'
          label='存储目录(可缺省)'
          helperText={error?.message ?? ' '}
          error={!!error}
        />
      )}
    />
  )

  const privateElem = (
    <Controller
      name='private'
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl error={!!error} size='small'>
          <FormControlLabel
            control={<Checkbox size='small' checked={field.value} {...field} />}
            label='私密文件'
          />
          <FormHelperText>{error?.message ?? ' '}</FormHelperText>
        </FormControl>
      )}
    />
  )

  const randomFilenameElem = (
    <Controller
      name='randomFilenameByServer'
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl error={!!error} size='small'>
          <FormControlLabel
            control={<Checkbox size='small' checked={field.value} {...field} />}
            label='随机文件名（服务器随机生成）'
          />
          <FormHelperText>{error?.message ?? ' '}</FormHelperText>
        </FormControl>
      )}
    />
  )

  const filesDisplayElem = (
    <>
      {fileInfos.map((info) => (
        <ListItem
          key={geneKey(info)}
          secondaryAction={
            <>
              {info.status !== 'pending' && (
                <CustomLoadingButton
                  aria-label='删除该文件'
                  color='error'
                  size='small'
                  onClick={async () => {
                    if (info.key) {
                      await deleteFile(info.key)
                    }
                    setFileInfoMap((prev) => omit(prev, [geneKey(info)]))
                  }}
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
          {info.url ? (
            <CopyToClipboard
              text={info.url}
              onCopy={() => toast.success('链接复制成功')}
            >
              <ListItemText
                primary={
                  <Typography
                    color={info.status === 'failed' ? 'error' : undefined}
                  >
                    {info.file.name}
                  </Typography>
                }
                sx={{ cursor: 'copy' }}
              />
            </CopyToClipboard>
          ) : (
            <ListItemText
              primary={
                <Typography
                  color={info.status === 'failed' ? 'error' : undefined}
                >
                  {info.file.name}
                </Typography>
              }
            />
          )}
        </ListItem>
      ))}
    </>
  )

  const filesActionElem = (
    <ListItem key='actions'>
      <ButtonGroup fullWidth>
        <Button fullWidth tabIndex={-1}>
          添加文件
          <input
            type='file'
            style={{
              opacity: 0,
              position: 'absolute',
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              cursor: 'pointer',
            }}
            multiple
            onInput={(e) => {
              const target = e.target as HTMLInputElement
              const files = Array.from(target.files ?? [])
              const fileToInfo = (f: File): FileInfo => ({
                file: f,
                status: 'before-upload',
              })
              updateFileInfos(files.map(fileToInfo), false)
            }}
          />
        </Button>
        <CustomLoadingButton fullWidth variant='contained' onClick={onSubmit}>
          立即上传
        </CustomLoadingButton>
      </ButtonGroup>
    </ListItem>
  )

  return (
    <>
      {/* 高级配置 */}
      <ListItem
        disablePadding
        secondaryAction={
          <IconButton tabIndex={-1} onClick={() => setOpen((prev) => !prev)}>
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        sx={{ bgcolor: 'background.paper' }}
      >
        <ListItemButton onClick={() => setOpen((prev) => !prev)}>
          <ListItemText primary='高级配置' />
        </ListItemButton>
      </ListItem>
      <Collapse in={open} timeout='auto' sx={{ bgcolor: 'background.paper' }}>
        <Stack spacing={1} direction='column' sx={{ p: 2 }}>
          {dirnameElem}
          {privateElem}
          {randomFilenameElem}
        </Stack>
      </Collapse>
      {/* 文件列表 */}
      <List
        sx={{
          width: '100%',
          maxWidth: '400px',
          mx: 'auto',
          mt: 2,
          bgcolor: 'background.paper',
        }}
      >
        {filesDisplayElem}
        {filesActionElem}
      </List>
    </>
  )
}
