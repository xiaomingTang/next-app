import { formatLrcItems, useLyricsEditor } from './store'
import { initAudioUrl, initLyricContent } from './initData'

import { LyricItem } from '../Lyrics'

import { AnchorProvider } from '@/components/AnchorProvider'
import { RawUploader } from '@/app/(default-layout)/upload/components/RawUploader'
import { cat } from '@/errors/catchAndToast'
import { customConfirm } from '@/utils/customConfirm'
import { openSimpleModal } from '@/components/SimpleModal'
import { sleepMs } from '@/utils/time'

import {
  Alert,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import EditIcon from '@mui/icons-material/Edit'
import RestoreIcon from '@mui/icons-material/Restore'
import LyricsIcon from '@mui/icons-material/Lyrics'
import PodcastsIcon from '@mui/icons-material/Podcasts'
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt'
import DownloadIcon from '@mui/icons-material/Download'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
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
            slotProps={{
              list: {
                'aria-labelledby': '关闭编辑器设置菜单',
              },
            }}
          >
            <MenuItem
              onClick={cat(async () => {
                useLyricsEditor.setState({
                  lrcContent: initLyricContent,
                  lrcItems: formatLrcItems(
                    initLyricContent
                      .split('\n')
                      .filter(Boolean)
                      .map((s) => new LyricItem(s))
                  ),
                })
                setAnchorEl(null)
                await useLyricsEditor.setAudioUrl(initAudioUrl)
                await sleepMs(1000)
                useLyricsEditor.resetTimeline()
              })}
            >
              <ListItemIcon>
                <SentimentSatisfiedAltIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText primary='测试音频及歌词' />
            </MenuItem>
            <MenuItem>
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
              <ListItemIcon>
                <LyricsIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText primary='文件上传' secondary='音频或歌词文件' />
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={cat(async () => {
                let text = useLyricsEditor
                  .getState()
                  .lrcItems.map((item) => item.toString())
                  .join('\n')
                await openSimpleModal({
                  dialogProps: {
                    maxWidth: 'md',
                  },
                  title: '歌词输入',
                  content: (
                    <>
                      <Alert severity='info' sx={{ mb: 2 }}>
                        <Typography>支持时间轴，每行一句歌词；</Typography>
                        <Typography>
                          如果歌词没有时间轴，建议后续手动执行“重置时间轴”的操作。
                        </Typography>
                      </Alert>
                      <TextField
                        autoFocus
                        multiline
                        fullWidth
                        minRows={10}
                        variant='outlined'
                        label='请输入歌词'
                        defaultValue={text}
                        onChange={(e) => {
                          text = e.target.value
                        }}
                      />
                    </>
                  ),
                })
                if (!text) {
                  throw new Error('请输入歌词')
                }
                useLyricsEditor.setState({
                  lrcContent: text,
                  lrcItems: formatLrcItems(
                    text
                      .split('\n')
                      .filter(Boolean)
                      .map((s) => new LyricItem(s))
                  ),
                })
                setAnchorEl(null)
              })}
            >
              <ListItemIcon>
                <EditIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText primary='输入/编辑全部歌词' />
            </MenuItem>
            <MenuItem
              onClick={cat(async () => {
                let text = useLyricsEditor.getState().audioUrl
                await openSimpleModal({
                  dialogProps: {
                    maxWidth: 'md',
                  },
                  title: '在线音频输入',
                  content: (
                    <>
                      <Alert severity='warning' sx={{ mb: 2 }}>
                        <Typography>
                          注意，在线音频不支持音频波形图。（建议使用本地音频文件）
                        </Typography>
                        <Typography>网址必须为 https://...</Typography>
                      </Alert>
                      <TextField
                        autoFocus
                        fullWidth
                        variant='outlined'
                        label='请输入音频的网址'
                        placeholder='https://...'
                        defaultValue={text}
                        onChange={(e) => {
                          text = e.target.value
                        }}
                      />
                    </>
                  ),
                })
                if (!text) {
                  throw new Error('请输入音频的网址')
                }
                setAnchorEl(null)
                await useLyricsEditor.setAudioUrl(text)
              })}
            >
              <ListItemIcon>
                <PodcastsIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText primary='输入在线音频' />
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={cat(async () => {
                useLyricsEditor.setState((prev) => {
                  const prevLrcItems = [...prev.lrcItems]
                  if (!prevLrcItems.find((item) => item.type === 'au')) {
                    prevLrcItems.unshift(
                      new LyricItem({ type: 'au', value: '未知' })
                    )
                  }
                  if (!prevLrcItems.find((item) => item.type === 'al')) {
                    prevLrcItems.unshift(
                      new LyricItem({ type: 'al', value: '未知' })
                    )
                  }
                  if (!prevLrcItems.find((item) => item.type === 'ar')) {
                    prevLrcItems.unshift(
                      new LyricItem({ type: 'ar', value: '未知' })
                    )
                  }
                  if (!prevLrcItems.find((item) => item.type === 'ti')) {
                    prevLrcItems.unshift(
                      new LyricItem({ type: 'ti', value: '未知' })
                    )
                  }
                  return { ...prev, lrcItems: prevLrcItems }
                })
                setAnchorEl(null)
              })}
            >
              <ListItemIcon>
                <ManageAccountsIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText primary='添加元数据模板' />
            </MenuItem>
            <MenuItem
              sx={{ color: theme.palette.error.main }}
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
            <Divider />
            <MenuItem
              onClick={cat(() => {
                useLyricsEditor.saveLrc()
                setAnchorEl(null)
              })}
            >
              <ListItemIcon>
                <DownloadIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText primary='导出歌词文件' />
            </MenuItem>
          </Menu>
        </>
      )}
    </AnchorProvider>
  )
}
