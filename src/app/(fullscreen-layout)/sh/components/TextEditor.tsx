'use client'

import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { cat } from '@/errors/catchAndToast'
import { SlideUp } from '@/components/Transitions'
import { useInjectHistory } from '@/hooks/useInjectHistory'
import { SilentError } from '@/errors/SilentError'
import { isCtrlAnd, useKeyDown } from '@/hooks/useKey'
import { useRawPlatform } from '@/utils/device'

import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import {
  Box,
  Button,
  TextField,
  Typography,
  useColorScheme,
} from '@mui/material'
import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import Editor from '@monaco-editor/react'
import { useState } from 'react'

interface TextEditorModalProps {
  title: string
  content: string
  onSave: (newContent: string) => Promise<string>
}

function hasChanged(s1: string, s2: string) {
  return s1.trim() !== s2.trim()
}

const TextEditorModal = NiceModal.create(
  ({ title, content: initialContent, onSave }: TextEditorModalProps) => {
    const { mode } = useColorScheme()
    const isMobile = useRawPlatform() === 'mobile'
    const modal = useModal()
    useInjectHistory(modal.visible, () => {
      modal.reject(new SilentError('操作已取消'))
      void modal.hide()
    })
    const [content, setContent] = useState(initialContent)

    const onSubmit = cat(async () => {
      const res = await onSave(content)
      modal.resolve(res)
      void modal.hide()
    })

    useKeyDown(async (e) => {
      if (isCtrlAnd('s', e)) {
        e.preventDefault()
        void onSubmit()
      }
    })

    const header = (
      <AppBar sx={{ mb: 1 }}>
        <Toolbar>
          <Button
            aria-label='取消编辑'
            color='inherit'
            onClick={() => {
              modal.reject(new SilentError('操作已取消'))
              void modal.hide()
            }}
          >
            <CloseIcon />
            <Typography component='span' sx={{ ml: 1 }}>
              {title}
            </Typography>
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <CustomLoadingButton
            color='inherit'
            title='保存 [快捷键 ctrl + s]'
            onClick={onSubmit}
          >
            保存
          </CustomLoadingButton>
        </Toolbar>
      </AppBar>
    )

    return (
      <Dialog
        fullWidth
        fullScreen
        slots={{
          transition: SlideUp,
        }}
        {...muiDialogV5(modal)}
        onClose={(_, reason) => {
          // 内容发生改变时, 禁用 esc close
          if (
            reason === 'escapeKeyDown' &&
            hasChanged(content, initialContent)
          ) {
            return
          }
          modal.reject(new SilentError('操作已取消'))
          void modal.hide()
        }}
      >
        {header}
        {isMobile && (
          <TextField
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
            }}
            multiline
            minRows={80}
            maxRows={30}
            sx={{
              flexGrow: 1,
            }}
            slotProps={{
              htmlInput: {
                sx: {
                  overflow: 'auto',
                },
              },
            }}
          />
        )}
        {!isMobile && (
          <Editor
            theme={mode === 'dark' ? 'vs-dark' : 'light'}
            defaultValue={content}
            onChange={(value = '') => {
              setContent(value)
            }}
            options={{
              scrollBeyondLastLine: true,
              scrollbar: {
                alwaysConsumeMouseWheel: false,
              },
            }}
          />
        )}
      </Dialog>
    )
  }
)

export function editText(props: TextEditorModalProps): Promise<string> {
  return NiceModal.show(TextEditorModal, props)
}
