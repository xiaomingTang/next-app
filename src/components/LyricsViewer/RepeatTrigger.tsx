import { AnchorProvider } from '../AnchorProvider'
import { useAudio } from '../useAudio'

import RepeatOneIcon from '@mui/icons-material/RepeatOne'
import RepeatIcon from '@mui/icons-material/Repeat'
import LooksOneIcon from '@mui/icons-material/LooksOne'
import SwipeRightAltIcon from '@mui/icons-material/SwipeRightAlt'
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material'

import type { RepeatMode } from '../useAudio'

const RepeatModeList: RepeatMode[] = [
  'Repeat-Playlist',
  'Repeat-Single',
  'Play-in-Order',
  'Pause-when-Finished',
]

const RepeatModeMap: Record<
  RepeatMode,
  {
    title: React.ReactNode
    icon: React.ReactNode
  }
> = {
  'Repeat-Playlist': {
    title: '列表循环',
    icon: <RepeatIcon />,
  },
  'Repeat-Single': {
    title: '单曲循环',
    icon: <RepeatOneIcon />,
  },
  'Play-in-Order': {
    title: '顺序播放',
    icon: <SwipeRightAltIcon />,
  },
  'Pause-when-Finished': {
    title: '播完暂停',
    icon: <LooksOneIcon />,
  },
}

export function RepeatTrigger() {
  const {
    settings: { repeatMode },
  } = useAudio()
  return (
    <AnchorProvider>
      {(anchorEl, setAnchorEl) => (
        <>
          <IconButton
            aria-label='设置歌曲循环模式'
            aria-controls={anchorEl ? 'repeat-setting' : undefined}
            onClick={(e) => {
              setAnchorEl(e.currentTarget)
            }}
          >
            {RepeatModeMap[repeatMode].icon}
          </IconButton>
          <Menu
            id='repeat-setting'
            anchorEl={anchorEl}
            open={!!anchorEl}
            autoFocus
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            onClose={() => setAnchorEl(null)}
            MenuListProps={{
              'aria-labelledby': '关闭设置菜单',
            }}
          >
            {RepeatModeList.map((k) => (
              <MenuItem
                key={k}
                selected={repeatMode === k}
                onClick={() => {
                  useAudio.setState({
                    settings: {
                      repeatMode: k,
                    },
                  })
                  setAnchorEl(null)
                }}
              >
                <ListItemIcon>{RepeatModeMap[k].icon}</ListItemIcon>
                <ListItemText>{RepeatModeMap[k].title}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </AnchorProvider>
  )
}
