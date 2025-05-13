import { shouldStretch } from './utils'

import { AnchorProvider } from '@/components/AnchorProvider'
import { Crop, type CropParams } from '@/components/Crop'
import { useElementSize } from '@/hooks/useElementSize'
import { useTick } from '@/hooks/useTick'

import { useMemo, useState } from 'react'
import { Alert, Box, Button, Collapse } from '@mui/material'
import CropIcon from '@mui/icons-material/Crop'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { clamp } from 'lodash-es'
import Image from 'next/image'

import type { ImageInfo } from '../store'

interface CropGifProps {
  realSize: { width: number; height: number }
  images: ImageInfo[]
  cropParams: CropParams
  onChange: (value: CropParams) => void
}

function SimulatedGif({
  images,
  realSize,
}: Pick<CropGifProps, 'images' | 'realSize'>) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex % images.length]

  const willStretch = useMemo(() => {
    if (!activeImage) {
      return false
    }
    return shouldStretch(realSize, activeImage)
  }, [activeImage, realSize])

  useTick((now, prev) => {
    if (now - prev < 500) {
      return false
    }
    setActiveIndex((prev) => prev + 1)
  })

  return (
    <Image
      src={activeImage.url}
      alt='模拟 gif'
      width={activeImage.width}
      height={activeImage.height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: willStretch ? 'fill' : 'contain',
        objectPosition: 'center',
      }}
    />
  )
}

export function CropGif({
  realSize,
  images,
  cropParams,
  onChange,
}: CropGifProps) {
  const { x, y, w, h } = cropParams
  const [visialSize, _, setElement, updateVisialSize] =
    useElementSize('clientSize')
  const rx = visialSize.width / realSize.width
  const ry = visialSize.height / realSize.height

  return (
    <AnchorProvider>
      {(anchorEl, setAnchorEl) => (
        <>
          <Button
            title={`${anchorEl ? '收起' : '展开'}本站友链信息`}
            sx={{
              fontWeight: 'bold',
            }}
            onClick={(e) => {
              setAnchorEl((prev) => (prev ? null : e.currentTarget))
            }}
          >
            <CropIcon /> 裁切 {x}:{y}:{w}:{h}{' '}
            {!anchorEl ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </Button>
          <Collapse
            in={!!anchorEl}
            timeout='auto'
            onEntered={updateVisialSize}
            onExited={updateVisialSize}
          >
            <Alert severity='warning' icon={false} sx={{ mb: 1 }}>
              此处是模拟 gif, 仅用于裁切
            </Alert>
            <Box
              ref={setElement}
              sx={{
                position: 'relative',
                width: '100%',
                backgroundColor: '#1188ee',
                overflow: 'hidden',
              }}
              style={{
                paddingBottom: `${(realSize.height / realSize.width) * 100}%`,
              }}
            >
              <SimulatedGif images={images} realSize={realSize} />
              <Crop
                value={{
                  x: x * rx,
                  y: y * ry,
                  w: w * rx,
                  h: h * ry,
                }}
                onChange={(e) => {
                  const finalX = Math.max(0, Math.round(e.x / rx))
                  const finalY = Math.max(0, Math.round(e.y / ry))
                  const newCropParams = {
                    x: finalX,
                    y: finalY,
                    w: clamp(Math.round(e.w / rx), 10, realSize.width - finalX),
                    h: clamp(
                      Math.round(e.h / ry),
                      10,
                      realSize.height - finalY
                    ),
                  }
                  onChange(newCropParams)
                }}
              />
            </Box>
          </Collapse>
        </>
      )}
    </AnchorProvider>
  )
}
