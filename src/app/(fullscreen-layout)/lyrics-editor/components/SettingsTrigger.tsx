import { useLyricsEditor } from './store'

import { AnchorProvider } from '@/components/AnchorProvider'
import { RawUploader } from '@/app/(default-layout)/upload/components/RawUploader'
import { cat } from '@/errors/catchAndToast'

import { IconButton, ListItemText, Menu, MenuItem } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'

export function SettingsTrigger() {
  return (
    <AnchorProvider>
      {(anchorEl, setAnchorEl) => (
        <>
          <IconButton
            aria-label='编辑器设置'
            aria-controls={anchorEl ? 'lyrics-editor-settings-menu' : undefined}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              position: 'absolute',
              top: '8px',
              right: '8px',
            }}
          >
            <SettingsIcon />
          </IconButton>
          <Menu
            id='lyrics-editor-settings-menu'
            anchorEl={anchorEl}
            open={!!anchorEl}
            autoFocus
            onClose={() => setAnchorEl(null)}
            MenuListProps={{
              'aria-labelledby': '关闭编辑器设置菜单',
            }}
          >
            <MenuItem sx={{ position: 'relative' }}>
              <RawUploader
                multiple={true}
                accept='.txt,.lrc,audio/*'
                onChange={cat(async (files) => {
                  const audioFile = files.find((f) =>
                    f.type.startsWith('audio/')
                  )
                  const lrcFile = files.find(
                    (f) => !f.type.startsWith('audio/')
                  )
                  if (audioFile) {
                    await useLyricsEditor.setFile(audioFile, 'audio')
                  }
                  if (lrcFile) {
                    await useLyricsEditor.setFile(lrcFile, 'lrc')
                  }
                  if (!audioFile && !lrcFile) {
                    throw new Error('请上传音频或歌词文件')
                  }
                  setAnchorEl(null)
                })}
              />
              <ListItemText primary='文件上传' secondary='音频或歌词文件' />
            </MenuItem>
          </Menu>
        </>
      )}
    </AnchorProvider>
  )
}
