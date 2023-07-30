'use client'

import { FileInfoDisplay } from './FileInfoDisplay'

import { deleteFile, uploadFiles } from '../server'
import { geneFileKey } from '../utils/geneFileKey'

import { SA, toPlainError } from '@/errors/utils'
import { cat } from '@/errors/catchAndToast'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { SlideUpTransition } from '@/components/SlideUpTransition'

import CloseIcon from '@mui/icons-material/Close'
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
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useCallback, useMemo, useState } from 'react'
import { omit } from 'lodash-es'
import { toast } from 'react-hot-toast'
import CopyToClipboard from 'react-copy-to-clipboard'
import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'

import type { FileInfo } from './FileInfoDisplay'

interface UploaderProps {
  onSuccess?: (fileInfos: FileInfo[]) => void
}

// TODO: 做成弹窗形式 & 简易上传弹窗 & 全屏/轻量/单个文件上传 等
const Uploader = NiceModal.create(({ onSuccess }: UploaderProps) => {
  const modal = useModal()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'))
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
        (info) => [geneFileKey(info.file), info] as [string, FileInfo]
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
      render={({ field }) => (
        <TextField {...field} size='small' label='存储目录(可缺省)' />
      )}
    />
  )

  const privateElem = (
    <Controller
      name='private'
      control={control}
      render={({ field }) => (
        <FormControl size='small'>
          <FormControlLabel
            control={<Checkbox size='small' checked={field.value} {...field} />}
            label='私密文件'
          />
        </FormControl>
      )}
    />
  )

  const randomFilenameElem = (
    <Controller
      name='randomFilenameByServer'
      control={control}
      render={({ field }) => (
        <FormControl size='small'>
          <FormControlLabel
            control={<Checkbox size='small' checked={field.value} {...field} />}
            label='随机文件名（服务器随机生成）'
          />
        </FormControl>
      )}
    />
  )

  const settingMenu = (
    <Menu
      id='logout-menu'
      anchorEl={anchorEl}
      open={!!anchorEl}
      autoFocus
      onClose={() => setAnchorEl(null)}
      MenuListProps={{
        'aria-labelledby': '关闭设置菜单',
      }}
    >
      <Stack spacing={1} sx={{ p: 1 }}>
        {dirnameElem}
        {privateElem}
        {randomFilenameElem}
      </Stack>
    </Menu>
  )

  const header = (
    <>
      {settingMenu}
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar variant='dense'>
          <Box sx={{ flex: 1 }}>
            <IconButton
              edge='start'
              aria-label='设置'
              onClick={(e) => {
                setAnchorEl(e.currentTarget)
              }}
            >
              <SettingsIcon />
            </IconButton>
            <CopyToClipboard
              text={fileInfos
                .filter((info) => info.status === 'succeed')
                .map((info) => info.url ?? '')
                .join('\n')}
              onCopy={() => toast.success('复制成功')}
            >
              <IconButton aria-label='复制所有'>
                <CopyAllIcon />
              </IconButton>
            </CopyToClipboard>
          </Box>
          <IconButton
            edge='end'
            aria-label='取消编辑'
            onClick={() => {
              modal.hide()
              onSuccess?.(fileInfos.filter((info) => info.status === 'succeed'))
            }}
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </>
  )

  const filesDisplayElem = (
    <List>
      {fileInfos.map((info, index) => (
        <FileInfoDisplay
          key={geneFileKey(info.file)}
          {...info}
          index={index}
          onDelete={async () => {
            if (info.key) {
              await deleteFile(info.key)
            }
            setFileInfoMap((prev) => omit(prev, [geneFileKey(info.file)]))
          }}
        />
      ))}
    </List>
  )

  const actionsElem = (
    <>
      <Button variant='outlined' tabIndex={-1}>
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
      <CustomLoadingButton variant='contained' onClick={onSubmit}>
        立即上传
      </CustomLoadingButton>
    </>
  )

  return (
    <Dialog
      fullWidth
      fullScreen={fullScreen}
      TransitionComponent={SlideUpTransition}
      {...muiDialogV5(modal)}
      onClose={() => {
        modal.hide()
        onSuccess?.(fileInfos.filter((info) => info.status === 'succeed'))
      }}
    >
      {header}
      <DialogContent>{filesDisplayElem}</DialogContent>
      <DialogActions>{actionsElem}</DialogActions>
    </Dialog>
  )
})

export async function upload(): Promise<FileInfo[]> {
  return new Promise<FileInfo[]>((resolve) => {
    NiceModal.show(Uploader, {
      onSuccess: resolve,
    })
  })
}
