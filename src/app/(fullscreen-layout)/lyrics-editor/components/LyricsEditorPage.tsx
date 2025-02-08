'use client'

import { useLyricsEditor } from './store'
import { SettingsTrigger } from './SettingsTrigger'
import { AudioControls } from './AudioControls'
import { LyricsEditor } from './LyricsEditor'
import { Timeline } from './Timeline'

import { DefaultHeaderShim } from '@/layout/DefaultHeader'
import { useGlobalFileCatcherHandler } from '@/layout/components/useGlobalFileCatcherHandler'
import { cat } from '@/errors/catchAndToast'
import { useBeforeUnload } from '@/hooks/useBeforeUnload'

import { Box } from '@mui/material'
import { noop } from 'lodash-es'

export function LyricsEditorPage() {
  useGlobalFileCatcherHandler.useUpdateHandler(
    cat(async (files) => {
      const audioFile = files.find((f) => f.type.startsWith('audio/'))
      const lrcFile = files.find(
        (f) => f.name.endsWith('.lrc') || f.name.endsWith('.txt')
      )
      if (lrcFile) {
        await useLyricsEditor.setFile(lrcFile, 'lrc').catch(noop)
      }
      if (audioFile) {
        await useLyricsEditor.setFile(audioFile, 'audio').catch(noop)
      }
      if (!audioFile && !lrcFile) {
        throw new Error('请选择音频文件或歌词文件')
      }
    })
  )
  useBeforeUnload(useLyricsEditor((state) => state.lrcItems.length > 0))

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        alignItems: 'center',
      }}
    >
      <DefaultHeaderShim />
      {/* 歌词区 */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          flex: '1 1 auto',
          overflowY: 'auto',
        }}
      >
        <LyricsEditor />
        <SettingsTrigger />
      </Box>
      {/* 控制区 */}
      <AudioControls />
      {/* 时间 + 歌词时间轴 + 波形图区 */}
      <Timeline />
    </Box>
  )
}
