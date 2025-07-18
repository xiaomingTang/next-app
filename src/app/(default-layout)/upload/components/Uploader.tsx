'use client'

import { FileInfoDisplay } from './FileInfoDisplay'
import { RawUploader } from './RawUploader'

import { deleteFile, requestUploadFiles } from '../server'
import { fileToCopyableMarkdownStr, geneFileKey } from '../utils/geneFileKey'
import { checkIsImage } from '../utils/checkIsImage'
import { getCdnUrl } from '../utils/getCdnUrl'

import { setImageSizeForUrl } from '@/utils/urlImageSize'
import { SA, toPlainError } from '@/errors/utils'
import { cat } from '@/errors/catchAndToast'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { SlideUp } from '@/components/Transitions'
import { AnchorProvider } from '@/components/AnchorProvider'
import { useInjectHistory } from '@/hooks/useInjectHistory'
import { getImageSize } from '@/utils/getImageSize'
import { useUser } from '@/user'
import { copyToClipboard } from '@/utils/copyToClipboard'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SettingsIcon from '@mui/icons-material/Settings'
import CopyAllIcon from '@mui/icons-material/CopyAll'
import {
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  Stack,
  List,
  IconButton,
  Button,
  Dialog,
  DialogContent,
  Menu,
  AppBar,
  Toolbar,
  Box,
  DialogActions,
  useMediaQuery,
  useTheme,
  MenuItem,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { omit } from 'lodash-es'
import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import COS from 'cos-js-sdk-v5'

import type { FileInfo } from './FileInfoDisplay'

interface UploaderProps {
  defaultFiles?: File[]
  accept?: string
}

function initFileToInfo(f: File): FileInfo {
  return {
    file: f,
    status: 'before-upload',
  }
}

// TODO: 做成弹窗形式 & 简易上传弹窗 & 全屏/轻量/单个文件上传 等
const Uploader = NiceModal.create(
  ({ defaultFiles = [], accept }: UploaderProps) => {
    const user = useUser()
    const modal = useModal()
    const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'))
    const { handleSubmit, control } = useForm<{
      randomFilenameByServer: boolean
      dirname: string
    }>({
      defaultValues: {
        randomFilenameByServer: true,
        dirname: '',
      },
    })
    const [fileInfoMap, setFileInfoMap] = useState<Record<string, FileInfo>>({})
    const fileInfos = useMemo(() => Object.values(fileInfoMap), [fileInfoMap])
    const updateFileInfos = useCallback(
      (newFileInfos: FileInfo[], override = true) => {
        if (newFileInfos.length === 0) {
          return
        }
        const newFileInfoTuple = newFileInfos.map(
          (info) => [geneFileKey(info.file), info] as const
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
    const copyableTexts = fileInfos
      .filter((info) => info.status === 'succeed')
      .map((info) => ({
        raw: info.url,
        markdown: fileToCopyableMarkdownStr({
          url: info.url ?? '',
          file: info.file,
        }),
      }))
    // 所有的关闭都是 resolve 已成功的文件, 没有 reject
    const onClose = () => {
      modal.resolve(fileInfos.filter((info) => info.status === 'succeed'))
      void modal.hide()
    }
    useInjectHistory(modal.visible, onClose)
    useEffect(() => {
      updateFileInfos(defaultFiles.map(initFileToInfo), false)
    }, [defaultFiles, updateFileInfos])

    const onSubmit = useMemo(
      () =>
        handleSubmit(
          cat(async (e) => {
            const files = fileInfos
              .filter(
                (info) =>
                  info.status === 'before-upload' || info.status === 'failed'
              )
              .map((info) => info.file)
            if (files.length === 0) {
              throw new Error('没有待上传的文件')
            }
            updateFileInfos(
              files.map((f) => ({
                file: f,
                status: 'pending',
              }))
            )
            const res = await requestUploadFiles({
              ...e,
              files: files.map((f) => ({
                name: f.name,
                type: f.type,
                size: f.size,
              })),
            })
              .then(SA.decode)
              .catch((err) => {
                const errorMsg = toPlainError(err).message
                updateFileInfos(
                  files.map((f) => ({
                    file: f,
                    status: 'failed',
                    error: errorMsg,
                  }))
                )
                throw err
              })
            await Promise.allSettled(
              res.map(async (item, idx) => {
                const f = files[idx]
                try {
                  if (item.status === 'rejected') {
                    throw new Error(item.reason)
                  }
                  const { key, credential } = item.value
                  await new COS({
                    SecretId: credential.tmpSecretId,
                    SecretKey: credential.tmpSecretKey,
                    SecurityToken: credential.sessionToken,
                    Protocol: 'https:',
                  })
                    .putObject({
                      Bucket: process.env.NEXT_PUBLIC_TC_COS_BUCKET,
                      Region: process.env.NEXT_PUBLIC_TC_COS_REGION,
                      Key: key,
                      Body: f,
                    })
                    .then((r) => {
                      const code = r.statusCode
                      if (!(code && code >= 200 && code < 300)) {
                        throw new Error(`${code}`)
                      }
                    })
                  const url = getCdnUrl({ key })
                  if (checkIsImage(f)) {
                    setImageSizeForUrl(url, await getImageSize(f))
                  }
                  updateFileInfos([
                    {
                      file: f,
                      status: 'succeed',
                      url: url.href,
                    },
                  ])
                } catch (error) {
                  updateFileInfos([
                    {
                      file: f,
                      status: 'failed',
                      error: toPlainError(error).message,
                    },
                  ])
                }
              })
            )
          })
        ),
      [fileInfos, handleSubmit, updateFileInfos]
    )

    const dirnameElem = (
      <Controller
        name='dirname'
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            disabled={user.role !== 'ADMIN'}
            label='存储目录(可缺省)'
          />
        )}
      />
    )

    const randomFilenameElem = (
      <Controller
        name='randomFilenameByServer'
        control={control}
        render={({ field }) => (
          <FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  disabled={user.role !== 'ADMIN'}
                  {...field}
                />
              }
              label='随机文件名（服务器随机生成）'
            />
          </FormControl>
        )}
      />
    )

    const settingTriggerElem = (
      <AnchorProvider>
        {(anchorEl, setAnchorEl) => (
          <>
            <IconButton
              edge='start'
              aria-label='设置'
              aria-controls={anchorEl ? 'upload-settings-menu' : undefined}
              onClick={(e) => {
                setAnchorEl(e.currentTarget)
              }}
            >
              <SettingsIcon />
            </IconButton>
            <Menu
              id='upload-settings-menu'
              anchorEl={anchorEl}
              open={!!anchorEl}
              autoFocus
              onClose={() => setAnchorEl(null)}
              slotProps={{
                list: {
                  'aria-labelledby': '关闭设置菜单',
                },
              }}
            >
              <Stack spacing={1} sx={{ p: 1 }}>
                {dirnameElem}
                {randomFilenameElem}
              </Stack>
            </Menu>
          </>
        )}
      </AnchorProvider>
    )

    const copyTriggerElem = (
      <AnchorProvider>
        {(copyableAnchorEl, setCopyableAnchorEl) =>
          copyableTexts.length > 0 && (
            <>
              <IconButton
                aria-label='打开复制选项'
                onClick={(e) => setCopyableAnchorEl(e.currentTarget)}
              >
                <CopyAllIcon />
              </IconButton>
              <Menu
                autoFocus
                open={!!copyableAnchorEl}
                anchorEl={copyableAnchorEl}
                onClose={() => setCopyableAnchorEl(null)}
              >
                <MenuItem
                  onClick={() => {
                    setCopyableAnchorEl(null)
                    void copyToClipboard(
                      copyableTexts.map((t) => t.raw).join('\n')
                    )
                  }}
                >
                  复制所有 url
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setCopyableAnchorEl(null)
                    void copyToClipboard(
                      copyableTexts.map((t) => t.markdown).join('\n')
                    )
                  }}
                >
                  复制所有 markdown 格式
                </MenuItem>
              </Menu>
            </>
          )
        }
      </AnchorProvider>
    )

    const header = (
      <>
        <AppBar>
          <Toolbar>
            <Box sx={{ flex: 1 }}>
              {settingTriggerElem}
              {copyTriggerElem}
            </Box>
            <IconButton edge='end' aria-label='完成' onClick={onClose}>
              <CheckCircleIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </>
    )

    const filesDisplayElem = (
      <List>
        {fileInfos.map((info, index) => (
          <FileInfoDisplay
            {...info}
            key={geneFileKey(info.file)}
            index={index}
            onDelete={cat(async () => {
              if (info.url) {
                await deleteFile(info.url).then(SA.decode)
              }
              setFileInfoMap((prev) => omit(prev, [geneFileKey(info.file)]))
            })}
          />
        ))}
      </List>
    )

    const actionsElem = (
      <>
        <Button variant='outlined' tabIndex={-1}>
          添加文件
          <RawUploader
            multiple
            accept={accept}
            onChange={(files) => {
              updateFileInfos(files.map(initFileToInfo), false)
            }}
          />
        </Button>
        <CustomLoadingButton variant='contained' onClick={onSubmit}>
          立即上传
        </CustomLoadingButton>
      </>
    )

    return (
      <Dialog
        fullWidth
        fullScreen={fullScreen}
        slots={{
          transition: SlideUp,
        }}
        {...muiDialogV5(modal)}
        onClose={onClose}
      >
        {header}
        <DialogContent sx={{ height: 'calc(var(--vh)*100)' }}>
          {filesDisplayElem}
        </DialogContent>
        <DialogActions>{actionsElem}</DialogActions>
      </Dialog>
    )
  }
)

export async function upload(
  defaultFiles: File[] = [],
  options?: {
    accept?: string
  }
): Promise<FileInfo[]> {
  return NiceModal.show(Uploader, {
    defaultFiles,
    accept: options?.accept,
  })
}
