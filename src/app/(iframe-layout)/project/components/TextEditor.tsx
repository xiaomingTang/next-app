import { useUser } from '@/user'

import { Editor } from '@monaco-editor/react'
import { Box, CircularProgress, useColorScheme } from '@mui/material'

import type { ProjectPageProps } from './ProjectPage'

export function TextEditor(projectInfo: ProjectPageProps) {
  const user = useUser()
  const editable =
    user.id === projectInfo.projectTree?.creatorId || user.role === 'ADMIN'
  const { mode } = useColorScheme()
  return (
    <Editor
      key={
        projectInfo.projectTree?.hash || projectInfo.error?.message || 'loading'
      }
      theme={mode === 'dark' ? 'vs-dark' : 'light'}
      defaultLanguage='markdown'
      defaultValue={
        projectInfo.error
          ? `加载出错：${projectInfo.error.message}`
          : '加载中...'
      }
      loading={
        <Box sx={{ display: 'flex' }}>
          <CircularProgress size='24px' />
        </Box>
      }
      options={{
        tabSize: 2,
        lineNumbers: projectInfo.projectTree ? 'on' : 'off',
        placeholder: `输入内容 - ctrl + S 以保存`,
        readOnly: !editable || projectInfo.loading || !!projectInfo.error,
        scrollBeyondLastLine: true,
        minimap: {
          enabled: !!projectInfo.projectTree,
        },
        scrollbar: {
          alwaysConsumeMouseWheel: false,
        },
      }}
    />
  )
}
