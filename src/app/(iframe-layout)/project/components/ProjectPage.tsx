'use client'

import 'react-photo-view/dist/react-photo-view.css'

import { TextEditor } from './TextEditor'
import { ProjectMenu } from './ProjectMenu'
import { OtherFileViewer } from './OtherFileViewer'

import { type ProjectTree } from '../utils/arrayToTree'
import { useProjectPath } from '../utils/useProjectPath'

import { type PlainError } from '@/errors/utils'
import { useInjectHistory } from '@/hooks/useInjectHistory'
import { PreferFullscreenLandscape } from '@/components/PreferFullscreenLandscape'

import { Alert, Box, NoSsr } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { PhotoProvider } from 'react-photo-view'

import type { LoadingAble } from '@/components/ServerComponent'

export type ProjectPageProps = LoadingAble<{
  projectTree: ProjectTree
  paths: string[]
}> & {
  error?: PlainError
}

export function ProjectPage(projectInfo: ProjectPageProps) {
  const rootHash = projectInfo.projectTree?.hash
  const { paths } = projectInfo
  const [previewVisible, setPreviewVisible] = useState(false)
  const closeRef = useRef<() => void>()

  useInjectHistory(previewVisible, () => {
    closeRef.current?.()
  })

  useEffect(() => {
    if (rootHash) {
      useProjectPath.setRootHash(rootHash)
    }
    if (paths) {
      useProjectPath.replace(paths)
    }
  }, [rootHash, paths])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        height: 'calc(var(--vh, 1vh)*100)',
      }}
    >
      <ProjectMenu {...projectInfo} />
      <Box
        sx={{
          position: 'relative',
          width: '0%',
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* TODO: 文件名栏 & loading 放文件名上 */}
        <TextEditor {...projectInfo} />
        <PhotoProvider
          onVisibleChange={(visible) => {
            setPreviewVisible(visible)
          }}
          toolbarRender={({ onClose }) => {
            closeRef.current = onClose
            return <></>
          }}
        >
          <OtherFileViewer {...projectInfo} />
        </PhotoProvider>
        {projectInfo.error && (
          <Box sx={{ width: '100%', height: '100%' }}>
            <Alert severity='error'>{projectInfo.error.message}</Alert>
          </Box>
        )}
      </Box>
      <NoSsr>
        <PreferFullscreenLandscape />
      </NoSsr>
    </Box>
  )
}
