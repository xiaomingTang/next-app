import { AnchorProvider } from '../AnchorProvider'
import { useAudio } from '../GlobalAudioPlayer'

import MenuIcon from '@mui/icons-material/Menu'
import { IconButton, ListItemText, Menu, MenuItem } from '@mui/material'

export function MusicListTrigger() {
  const { activeMP3, controls } = useAudio()
  return (
    <AnchorProvider>
      {(anchorEl, setAnchorEl) => (
        <>
          <IconButton
            aria-label='歌曲目录'
            aria-controls={anchorEl ? 'music-list' : undefined}
            onClick={(e) => {
              setAnchorEl(e.currentTarget)
            }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id='music-list'
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
              'aria-labelledby': '关闭歌曲目录',
            }}
          >
            {globalThis.mp3s.map((mp3) => (
              <MenuItem
                key={mp3.hash}
                selected={activeMP3?.hash === mp3.hash}
                onClick={() => {
                  controls.switchTo(mp3)
                  controls.play()
                  setAnchorEl(null)
                }}
              >
                <ListItemText>{mp3.name}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </AnchorProvider>
  )
}
