import { useProjectPath } from '../utils/useProjectPath'
import { findItemByPath } from '../utils/arrayToTree'
import { getProjectContent, updateProject } from '../server'

import { useUser } from '@/user'
import { SA } from '@/errors/utils'
import { useKeyDown } from '@/hooks/useKey'
import { useListen } from '@/hooks/useListen'
import { cat } from '@/errors/catchAndToast'

import { Editor } from '@monaco-editor/react'
import { Box, CircularProgress, useColorScheme } from '@mui/material'
import useSWR from 'swr'
import { useState } from 'react'

import type { ProjectPageProps } from './ProjectPage'

export function TextEditor(projectInfo: ProjectPageProps) {
  const user = useUser()
  const editable =
    user.id === projectInfo.projectTree?.creatorId || user.role === 'ADMIN'
  const { mode } = useColorScheme()
  const { path: curPath } = useProjectPath()
  const curItem = findItemByPath(projectInfo.projectTree, curPath)
  const curHash = curItem?.hash
  const isTxt = curItem?.type === 'TEXT'
  const [localContent, setLocalContent] = useState('')
  // 见鬼了，这里的 useSWR 的 key 必须和 OtherFileViewer 类型不一致，否则会导致只有这里能正常执行
  const { data: content = '', mutate } = useSWR(
    JSON.stringify([
      'getProjectContent',
      curHash,
      curItem?.type,
      curItem?.updatedAt.toISOString(),
    ]),
    cat(async () => {
      if (!curHash || !isTxt) {
        return ''
      }
      return getProjectContent({ hash: curHash })
        .then(SA.decode)
        .then((res) => res ?? '')
    })
  )

  useListen(content, () => {
    // TODO: 当内容有变时，需要用户确认
    setLocalContent(content)
  })

  useKeyDown(async (e) => {
    if (
      curHash &&
      isTxt &&
      (e.ctrlKey || e.metaKey) &&
      e.key === 's' &&
      editable
    ) {
      e.preventDefault()
      await updateProject({
        hash: curHash,
        content: localContent,
      }).then(SA.decode)
      void mutate()
    }
  })

  if (projectInfo.error || !isTxt) {
    return <></>
  }

  return (
    <Editor
      key={content || projectInfo.projectTree?.hash || 'loading'}
      theme={mode === 'dark' ? 'vs-dark' : 'light'}
      defaultLanguage='markdown'
      defaultValue={content}
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
      onChange={(value) => {
        setLocalContent(value ?? '')
      }}
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
