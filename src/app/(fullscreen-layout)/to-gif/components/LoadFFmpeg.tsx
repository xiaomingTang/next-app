import { getFFmpeg } from '../getFFmpeg'

import { useLoading } from '@/hooks/useLoading'
import { cat } from '@/errors/catchAndToast'

import { toBlobURL } from '@ffmpeg/util'
import {
  Box,
  Typography,
  ButtonGroup,
  Button,
  Menu,
  MenuItem,
  Grow,
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useState } from 'react'

import type { ExitableProps } from './Exitable'

interface FFmpegSource {
  name: 'unpkg' | 'jsDelivr'
  coreURL: string
  wasmURL: string
}

const FFMPEG_SOURCES: FFmpegSource[] = [
  {
    name: 'unpkg',
    coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js',
    wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm',
  },
  {
    name: 'jsDelivr',
    coreURL:
      'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.min.js',
    wasmURL:
      'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm',
  },
]

async function loadFFmpeg(source: FFmpegSource) {
  const ffmpeg = getFFmpeg()
  if (ffmpeg.loaded) {
    return
  }
  await ffmpeg.load({
    coreURL: await toBlobURL(source.coreURL, 'text/javascript'),
    wasmURL: await toBlobURL(source.wasmURL, 'application/wasm'),
  })
}

export function LoadFFmpeg({ exited, onExited }: ExitableProps) {
  const [source, setSource] = useState(FFMPEG_SOURCES[0])
  const [loading, withLoading] = useLoading()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [loaded, setLoaded] = useState(false)

  return (
    <Grow appear={false} in={!loaded} onExited={() => onExited(true)}>
      <Box
        sx={{
          display: exited ? 'none' : 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          p: 2,
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Typography variant='body2'>
          ffmpeg gzip 后约 10MB，首次加载可能需要一些时间，请耐心等待。
        </Typography>
        <Typography variant='body2'>
          图片转 gif 完全在浏览器中进行，本站不会上传你的图片，请放心使用。
        </Typography>
        <ButtonGroup
          variant='contained'
          size='large'
          disabled={loading}
          sx={{ mt: 1 }}
        >
          <Button
            loading={loading}
            onClick={cat(
              withLoading(() =>
                loadFFmpeg(source).then(() => {
                  setLoaded(true)
                })
              )
            )}
          >
            加载 ffmpeg
          </Button>
          <Button
            id='ffmpeg-sources-trigger'
            aria-controls={open ? 'ffmpeg-sources-menu' : undefined}
            aria-haspopup='true'
            aria-expanded={open ? 'true' : undefined}
            variant='outlined'
            endIcon={<KeyboardArrowDownIcon />}
            onClick={(e) =>
              setAnchorEl((prev) => (prev ? null : e.currentTarget))
            }
          >
            {source.name} 源
          </Button>
        </ButtonGroup>
        <Menu
          id='ffmpeg-sources-menu'
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          slotProps={{
            root: {
              'aria-labelledby': 'ffmpeg-sources-trigger',
            },
          }}
        >
          {FFMPEG_SOURCES.map((s) => (
            <MenuItem
              key={s.name}
              selected={s.name === source.name}
              onClick={() => {
                setAnchorEl(null)
                setSource(s)
              }}
            >
              {s.name}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Grow>
  )
}
