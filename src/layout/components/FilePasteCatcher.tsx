'use client'

import { upload } from '@D/upload/components/Uploader'
import { useUser } from '@/user'
import { dark } from '@/utils/theme'

import { noop } from 'lodash-es'
import { useEffect, useState } from 'react'
import { Box, Fade, Typography, alpha } from '@mui/material'
import { common } from '@mui/material/colors'

export function FilePasteCatcher() {
  const user = useUser()
  const [dragging, setDragging] = useState(false)

  // 监听文件粘贴
  useEffect(() => {
    if (!user.id) {
      return noop
    }
    const onPaste = (e: ClipboardEvent) => {
      // 需要把文件夹过滤掉 (文件夹没有 type)
      const files = Array.from(e.clipboardData?.files ?? []).filter(
        (f) => f.size > 0
      )
      if (files.length > 0) {
        upload(files)
      }
    }
    window.addEventListener('paste', onPaste)
    return () => {
      window.removeEventListener('paste', onPaste)
    }
  }, [user.id])

  // 监听文件拖拽
  useEffect(() => {
    const dndElement = document.documentElement
    const dragHandler = (e: DragEvent, cb: (files: FileList) => void) => {
      const files = e.dataTransfer?.files
      if (files) {
        e.preventDefault()
        cb(files)
      }
    }
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
      dragHandler(e, (files) => {
        setDragging(false)
        upload([...files])
      })
    }

    dndElement.addEventListener('dragenter', onDragenter)
    dndElement.addEventListener('dragover', onDragover)
    dndElement.addEventListener('dragleave', onDragleave)
    dndElement.addEventListener('drop', onDrop)

    return () => {
      dndElement.addEventListener('dragenter', onDragenter)
      dndElement.addEventListener('dragover', onDragover)
      dndElement.addEventListener('dragleave', onDragleave)
      dndElement.addEventListener('drop', onDrop)
    }
  }, [])

  return (
    <Fade in={dragging}>
      <Box
        sx={{
          zIndex: (theme) => theme.zIndex.tooltip + 1000,
          position: 'fixed',
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
