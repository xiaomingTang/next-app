'use client'

import { ImageWithState } from '@/components/ImageWithState'
import { adjustImageData, imageDataStatistics } from '@/utils/image'

import { Box, ButtonBase, Slider, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { blue } from '@mui/material/colors'

const colors: number[] = []
for (let i = 0; i < 360; i += 3) {
  colors.push(i)
}

const IMG_LIST = [
  {
    title: '前排-座椅',
    src: 'https://cdn.16px.cc/public/2023-12-04/d7DNSYgo2sg2.png?r=1000x500',
  },
  {
    title: '后排-座椅',
    src: 'https://cdn.16px.cc/public/2023-12-04/4UVU33kWo09u.png?r=1000x500',
  },
]

if (typeof window !== 'undefined') {
  console.warn(
    '如果你打开了 F12 且启用了 Network Disable cache，canvas 就会画不上，把 Disable cache 关掉就好了，原因我懒得解释'
  )
}

export function ColorIndex() {
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null)
  const targetCanvasRef = useRef<HTMLCanvasElement>(null)
  const [inputImageData, setInputImageData] = useState<ImageData | null>(null)
  const [targetHue, setTargetHue] = useState(0.5)
  const averageHsl = useMemo(() => {
    if (!inputImageData) {
      return null
    }
    return imageDataStatistics(inputImageData, 'hsl').average
  }, [inputImageData])
  const [imgIdx, setImgIdx] = useState(0)
  const [imgList, setImgList] = useState<HTMLImageElement[]>([])
  const activeImg = imgList[imgIdx]

  useEffect(() => {
    if (activeImg) {
      const sourceCanvas = sourceCanvasRef.current
      const targetCanvas = targetCanvasRef.current
      const sourceCtx = sourceCanvas?.getContext('2d')
      if (!sourceCanvas || !sourceCtx || !targetCanvas) {
        return
      }

      const { clientWidth: w, clientHeight: h } = sourceCanvas
      sourceCanvas.width = w
      sourceCanvas.height = h
      targetCanvas.width = w
      targetCanvas.height = h
      sourceCtx.drawImage(activeImg, 0, 0, w, h)
      const imgData = sourceCtx.getImageData(0, 0, w, h)
      setInputImageData(imgData)
    }
  }, [activeImg])

  useEffect(() => {
    const targetCanvas = targetCanvasRef.current
    const targetCtx = targetCanvas?.getContext('2d')
    if (!inputImageData || !averageHsl || !targetCtx) {
      return
    }
    const newImgData = adjustImageData({
      imgData: inputImageData,
      targetHsl: [targetHue, averageHsl[1], averageHsl[2]],
      averageHsl,
      type: 'hsl',
    })
    targetCtx.putImageData(newImgData, 0, 0)
  }, [averageHsl, inputImageData, targetHue])

  return (
    <>
      <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
        {IMG_LIST.map((item, i) => (
          <ButtonBase
            key={item.src}
            aria-label='图片选择'
            autoFocus={i === 0}
            onClick={() => setImgIdx(i)}
            sx={{
              display: 'inline-flex',
              borderRadius: 1,
              overflow: 'hidden',
              boxShadow: i === imgIdx ? `0 0 8px ${blue[700]}` : '',
              ':focus-visible': {
                outline: `1px solid ${blue[700]}`,
              },
            }}
          >
            <ImageWithState
              src={item.src}
              alt={item.title}
              width={100}
              height={50}
              crossOrigin='anonymous'
              onLoad={(e) => {
                const img = e.target as HTMLImageElement
                setImgList((prev) => {
                  const next = [...prev]
                  next[i] = img
                  return next
                })
              }}
            />
          </ButtonBase>
        ))}
      </Stack>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          pb: '50%',
        }}
      >
        <Box
          component='canvas'
          ref={sourceCanvasRef}
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
          }}
        />
      </Box>
      <Typography sx={{ my: 2, fontWeight: 'bold', fontSize: '1.5em' }}>
        拖动滑块，以修改颜色
      </Typography>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: '32px',
        }}
      >
        {colors.map((n) => (
          <Box
            key={n}
            sx={{
              width: `${100 / colors.length}%`,
              height: '100%',
              backgroundColor: `hsl(${n},${(averageHsl?.[1] ?? 1) * 100}%,${
                (averageHsl?.[2] ?? 1) * 100
              }%)`,
            }}
          />
        ))}
        <Slider
          aria-label='Temperature'
          defaultValue={100}
          valueLabelDisplay='off'
          step={1}
          min={1}
          max={359}
          onChange={(_, newValue) => {
            setTargetHue((newValue as number) / 360)
          }}
          sx={{
            position: 'absolute',
            width: '100%',
            top: 0,
            left: 0,
            transform: 'translateY(-50%)',
          }}
        />
      </Box>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          pb: '50%',
        }}
      >
        <Box
          component='canvas'
          ref={targetCanvasRef}
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
          }}
        />
      </Box>
    </>
  )
}
