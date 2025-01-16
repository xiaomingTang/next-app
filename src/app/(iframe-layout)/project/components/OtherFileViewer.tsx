import { useProjectPath } from '../utils/useProjectPath'
import { findItemByPath } from '../utils/arrayToTree'
import { getProjectContent } from '../server'

import { ImageWithState } from '@/components/ImageWithState'
import { SA } from '@/errors/utils'
import Anchor from '@/components/Anchor'
import { cat } from '@/errors/catchAndToast'

import { Alert, Box, CircularProgress, styled } from '@mui/material'
import useSWR from 'swr'

import type { ProjectPageProps } from './ProjectPage'

const Container = styled(Box)(() => ({
  display: 'flex',
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
}))

export function OtherFileViewer(projectInfo: ProjectPageProps) {
  const { path: curPath } = useProjectPath()
  const curItem = findItemByPath(projectInfo.projectTree, curPath)
  const curHash = curItem?.hash ?? ''
  const isOthers = curItem && curItem.type !== 'TEXT' && curItem.type !== 'DIR'
  // 见鬼了，这里的 useSWR 的 key 必须和 TextEditor 类型不一致，否则会导致只有那里能正常执行
  const { data: content = '', isValidating } = useSWR(
    [
      'getProjectContent',
      curHash,
      curItem?.type,
      curItem?.updatedAt.toISOString(),
    ],
    cat(async () => {
      if (!curHash || !isOthers) {
        return ''
      }
      return getProjectContent({ hash: curHash })
        .then(SA.decode)
        .then((res) => res ?? '')
    })
  )

  if (projectInfo.error || !isOthers) {
    return <></>
  }

  if (!curItem || !content) {
    if (isValidating) {
      return (
        <Container>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CircularProgress size={24} />
          </Box>
        </Container>
      )
    }
    return <></>
  }

  switch (curItem.type) {
    case 'TEXT':
    case 'DIR':
      return <></>
    case 'IMAGE':
      return (
        <Container>
          <ImageWithState
            src={content}
            alt={curItem.name}
            preview
            width={640}
            height={640}
            crossOrigin='anonymous'
            style={{
              display: 'block',
              margin: 'auto',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        </Container>
      )
    case 'AUDIO':
      return (
        <Container>
          <audio controls src={content} />
        </Container>
      )
    case 'VIDEO':
      return (
        <Container>
          <video controls src={content} />
        </Container>
      )
    default:
      return (
        <Container sx={{ alignItems: 'flex-start' }}>
          <Alert severity='info' sx={{ width: '100%' }}>
            未知文件类型，你可以{' '}
            <Anchor href={content}>点击使用浏览器打开或下载该文件</Anchor>
          </Alert>
        </Container>
      )
  }
}
