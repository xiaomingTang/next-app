import { useProjectPath } from '../utils/useProjectPath'
import { findItemByPath } from '../utils/arrayToTree'
import { getProjectContent, updateProject } from '../server'
import { guessLanguage } from '../utils/guessLanguage'

import { useUser } from '@/user'
import { SA } from '@/errors/utils'
import { useKeyDown } from '@/hooks/useKey'
import { useListen } from '@/hooks/useListen'
import { cat } from '@/errors/catchAndToast'
import { useLoading } from '@/hooks/useLoading'

import { Editor } from '@monaco-editor/react'
import { Box, CircularProgress, useColorScheme } from '@mui/material'
import useSWR from 'swr'
import { useState } from 'react'
import toast from 'react-hot-toast'

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
  const [saveLoading, withSaveLoading] = useLoading()
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
  const language = guessLanguage(curItem?.name)

  useListen(content, () => {
    // TODO: 当内容有变时，需要用户确认
    setLocalContent(content)
  })

  useKeyDown(
    withSaveLoading(
      cat(async (e) => {
        if (
          curHash &&
          isTxt &&
          (e.ctrlKey || e.metaKey) &&
          e.key === 's' &&
          editable
        ) {
          e.preventDefault()
          if (localContent === content) {
            toast.success('已保存成功')
            return
          }
          await updateProject({
            hash: curHash,
            content: localContent,
          }).then(SA.decode)
          toast.success('保存成功')
          await mutate()
        }
      })
    )
  )

  if (projectInfo.error || !isTxt) {
    return <></>
  }

  return (
    <>
      <Editor
        key={[
          language,
          content,
          projectInfo.projectTree?.hash,
          'loading',
          mode,
        ].join('-')}
        theme={mode === 'dark' ? 'vs-dark' : 'light'}
        language={language}
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
      {saveLoading && (
        <CircularProgress
          size={24}
          sx={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            pointerEvents: 'none',
          }}
        />
      )}
    </>
  )
}
