'use client'

import { useGlobalFileCatcherHandler } from './useGlobalFileCatcherHandler'

import { useUser } from '@/user'
import { dark } from '@/utils/theme'
import { cat } from '@/errors/catchAndToast'

import { useEffect, useState } from 'react'
import { Box, Fade, Typography, alpha } from '@mui/material'
import { common } from '@mui/material/colors'

function dragHandler(
  e: DragEvent,
  cb: (files: File[]) => void | Promise<void>
) {
  if (!e.dataTransfer) {
    return
  }
  const { types } = e.dataTransfer
  if (types.filter((type) => type === 'Files').length === 0) {
    return
  }
  e.preventDefault()
  void cb([...e.dataTransfer.files])
}

export function FileUploadCatcher() {
  const user = useUser()
  const [dragging, setDragging] = useState(false)

  // 监听文件粘贴
  useEffect(() => {
    const onPaste = cat(async (e: ClipboardEvent) => {
      // 需要把文件夹过滤掉 (文件夹没有 type)
      const files = Array.from(e.clipboardData?.files ?? []).filter(
        (f) => f.size > 0
      )
      if (files.length > 0) {
        await useGlobalFileCatcherHandler.getState().handler(files)
      }
    })
    window.addEventListener('paste', onPaste)
    return () => {
      window.removeEventListener('paste', onPaste)
    }
  }, [user.id])

  // 监听文件拖拽
  useEffect(() => {
    const dndElement = document.documentElement
    const onDragenter = (e: DragEvent) => {
      dragHandler(e, () => {
        setDragging(true)
      })
    }
    const onDragover = (e: DragEvent) => {
      dragHandler(e, () => {
        setDragging(true)
      })
    }
    const onDragleave = (e: DragEvent) => {
      dragHandler(e, () => {
        setDragging(false)
      })
    }
    const onDrop = (e: DragEvent) => {
      dragHandler(
        e,
        cat(async (files) => {
          setDragging(false)
          const availableFiles = files.filter((f) => f.size > 0)
          if (availableFiles.length > 0) {
            await useGlobalFileCatcherHandler.getState().handler(files)
          }
        })
      )
    }

    dndElement.addEventListener('dragenter', onDragenter)
    dndElement.addEventListener('dragover', onDragover)
    dndElement.addEventListener('dragleave', onDragleave)
    dndElement.addEventListener('drop', onDrop)

    return () => {
      dndElement.removeEventListener('dragenter', onDragenter)
      dndElement.removeEventListener('dragover', onDragover)
      dndElement.removeEventListener('dragleave', onDragleave)
      dndElement.removeEventListener('drop', onDrop)
    }
  }, [user.id])

  return (
    <Fade in={dragging} unmountOnExit style={{ pointerEvents: 'none' }}>
      <Box
        sx={{
          position: 'fixed',
          zIndex: (theme) => theme.zIndex.tooltip + 1000,
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          userSelect: 'none',
          backdropFilter: 'blur(8px)',
          backgroundColor: alpha(common.black, 0.8),
          color: 'white',
          [dark()]: {
            backgroundColor: alpha(common.white, 0.5),
            color: 'black',
          },
        }}
      >
        <Typography
          sx={{
            letterSpacing: '4px',
          }}
        >
          预备上传
        </Typography>
      </Box>
    </Fade>
  )
}
