'use client'

import { TextEditor } from './TextEditor'
import { ProjectMenu } from './ProjectMenu'

import { type ProjectTree } from '../utils/arrayToTree'

import { type PlainError } from '@/errors/utils'

import { Box } from '@mui/material'

import type { LoadingAble } from '@/components/ServerComponent'

export type ProjectPageProps = LoadingAble<{
  projectTree: ProjectTree
  paths: string[]
}> & {
  error?: PlainError
}

export function ProjectPage(projectInfo: ProjectPageProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
      }}
    >
      <ProjectMenu {...projectInfo} />
      <Box
        sx={{
          width: '0%',
          flexGrow: 1,
        }}
      >
        {/* TODO: 文件名栏 & loading 放文件名上 */}
        <TextEditor {...projectInfo} />
      </Box>
    </Box>
  )
}
