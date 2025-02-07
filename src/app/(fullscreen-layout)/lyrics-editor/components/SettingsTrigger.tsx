import { useLyricsEditor } from './store'

import { AnchorProvider } from '@/components/AnchorProvider'
import { RawUploader } from '@/app/(default-layout)/upload/components/RawUploader'
import { cat } from '@/errors/catchAndToast'

import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import StickyNote2Icon from '@mui/icons-material/StickyNote2'
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
                multiple={false}
                accept='.lrc,.txt'
                onChange={cat(async ([f]) => {
                  if (f) {
                    await useLyricsEditor.setFile(f, 'lrc')
                    setAnchorEl(null)
                  }
                })}
              />
              <ListItemIcon>
                <StickyNote2Icon fontSize='small' />
              </ListItemIcon>
              <ListItemText>歌词上传</ListItemText>
            </MenuItem>
            <MenuItem sx={{ position: 'relative' }}>
              <RawUploader
                multiple={false}
                accept='audio/*'
                onChange={cat(async ([f]) => {
                  if (f) {
                    await useLyricsEditor.setFile(f, 'audio')
                    setAnchorEl(null)
                  }
                })}
              />
              <ListItemIcon>
                <MusicNoteIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText>音频上传</ListItemText>
            </MenuItem>
          </Menu>
        </>
      )}
    </AnchorProvider>
  )
}
