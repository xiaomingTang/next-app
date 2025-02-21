import { useProjectPath } from '../utils/useProjectPath'
import { findItemByPath } from '../utils/arrayToTree'
import { getProjectContent, updateProject } from '../server'
import { guessLanguage } from '../utils/guessLanguage'

import { useUser } from '@/user'
import { SA } from '@/errors/utils'
import { isCtrlAnd, useKeyDown } from '@/hooks/useKey'
import { useListen } from '@/hooks/useListen'
import { cat } from '@/errors/catchAndToast'
import { useLoading } from '@/hooks/useLoading'
import { customConfirm } from '@/utils/customConfirm'
import { useBeforeUnload } from '@/hooks/useBeforeUnload'

import { Editor } from '@monaco-editor/react'
import { Box, Button, CircularProgress, useColorScheme } from '@mui/material'
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
  const language = guessLanguage(curItem?.name)
  const [localContent, setLocalContent] = useState('')
  const [saveLoading, withSaveLoading] = useLoading()

  // 见鬼了，这里的 useSWR 的 key 必须和 OtherFileViewer 类型不一致，否则会导致只有这里能正常执行
  const {
    data: content = '',
    isValidating: isLoadContentLoading,
    mutate,
  } = useSWR(
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
    setLocalContent(content)
  })

  // 前端路由前，提示用户保存
  useProjectPath.useBeforePathChanged(
    async (_, prevPath) => {
      if (
        !editable ||
        !prevPath ||
        !curHash ||
        !isTxt ||
        localContent === content ||
        !(await customConfirm('是否保存当前文件？', 'SLIGHT'))
      ) {
        return
      }
      await toast.promise(
        async () =>
          updateProject({
            hash: curHash,
            content: localContent,
          }).then(SA.decode),
        {
          loading: '正在保存...',
          success: '保存成功',
          error: '保存失败',
        }
      )
    },
    [content, localContent, editable, curHash, isTxt]
  )

  useBeforeUnload(editable && !!curHash && isTxt && localContent !== content)

  useKeyDown(
    withSaveLoading(
      cat(async (e) => {
        if (editable && curHash && isTxt && isCtrlAnd('s', e)) {
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
        key={projectInfo.projectTree?.hash}
        theme={mode === 'dark' ? 'vs-dark' : 'light'}
        path={`file://${curPath}`}
        language={language}
        value={content}
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
      {(saveLoading || isLoadContentLoading) && (
        <CircularProgress
          size={24}
          sx={{
            position: 'absolute',
            top: '24px',
            left: '50%',
            pointerEvents: 'none',
          }}
        />
      )}
      {editable && curHash && localContent !== content && (
        <Button
          loading={saveLoading}
          variant='contained'
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: '24px',
            transform: 'translateX(-50%)',
          }}
          onClick={withSaveLoading(
            cat(async () => {
              await updateProject({
                hash: curHash,
                content: localContent,
              }).then(SA.decode)
              toast.success('保存成功')
              await mutate()
            })
          )}
        >
          保存
        </Button>
      )}
    </>
  )
}
