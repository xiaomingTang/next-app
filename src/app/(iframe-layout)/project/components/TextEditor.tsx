import { useProjectPath } from '../utils/useProjectPath'
import { findItemByPath } from '../utils/arrayToTree'

import { useUser } from '@/user'

import { Editor } from '@monaco-editor/react'
import { Box, CircularProgress, useColorScheme } from '@mui/material'

import type { ProjectPageProps } from './ProjectPage'

export function TextEditor(projectInfo: ProjectPageProps) {
  const user = useUser()
  const editable =
    user.id === projectInfo.projectTree?.creatorId || user.role === 'ADMIN'
  const { mode } = useColorScheme()
  const { path: curPath } = useProjectPath()
  const curItem = findItemByPath(projectInfo.projectTree, curPath)

  if (projectInfo.error || curItem?.type !== 'TEXT') {
    return <></>
  }

  return (
    <Editor
      key={projectInfo.projectTree?.hash || 'loading'}
      theme={mode === 'dark' ? 'vs-dark' : 'light'}
      defaultLanguage='markdown'
      defaultValue={'加载中...'}
      loading={
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress size='24px' />
        </Box>
      }
      options={{
        tabSize: 2,
        lineNumbers: projectInfo.projectTree ? 'on' : 'off',
        placeholder: `输入内容 - ctrl + S 以保存`,
        readOnly: !editable || projectInfo.loading,
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
