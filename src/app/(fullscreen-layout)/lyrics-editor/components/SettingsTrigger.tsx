import { useLyricsEditor } from './store'

import { AnchorProvider } from '@/components/AnchorProvider'
import { RawUploader } from '@/app/(default-layout)/upload/components/RawUploader'
import { cat } from '@/errors/catchAndToast'
import { customConfirm } from '@/utils/customConfirm'

import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  useTheme,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import EditIcon from '@mui/icons-material/Edit'
import RestoreIcon from '@mui/icons-material/Restore'
import toast from 'react-hot-toast'

export function SettingsTrigger() {
  const theme = useTheme()
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
                multiple
                accept='.txt,.lrc,audio/*'
                onChange={cat(async (files) => {
                  const audioFile = files.find((f) =>
                    f.type.startsWith('audio/')
                  )
                  const lrcFile = files.find(
                    (f) => f.name.endsWith('.txt') || f.name.endsWith('.lrc')
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
            <MenuItem sx={{ position: 'relative' }}>
              <ListItemIcon>
                <EditIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText primary='输入全部歌词（TODO）' />
            </MenuItem>
            <MenuItem
              sx={{ position: 'relative', color: theme.palette.error.main }}
              onClick={cat(async () => {
                if (
                  await customConfirm(
                    '重置时间轴是指：将时间按歌词数量平均分配。是否继续？',
                    'SLIGHT'
                  )
                ) {
                  useLyricsEditor.resetTimeline()
                  setAnchorEl(null)
                  toast.success('时间轴已重置')
                }
              })}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                <RestoreIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText primary='重置时间轴' />
            </MenuItem>
          </Menu>
        </>
      )}
    </AnchorProvider>
  )
}
