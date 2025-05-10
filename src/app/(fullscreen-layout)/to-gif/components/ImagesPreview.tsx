import { getFFmpeg } from '../getFFmpeg'

import { isInputting, useKeyDown } from '@/hooks/useKey'
import { useListen } from '@/hooks/useListen'
import { DefaultHeaderShim } from '@/layout/DefaultHeader'

import { Box, Button, Divider } from '@mui/material'
import { clsx } from 'clsx'
import { clamp } from 'lodash-es'
import Image from 'next/image'
import { useState } from 'react'
import { create } from 'zustand'

export const useImages = create(() => ({
  images: [] as {
    type: string
    url: string
    width: number
    height: number
    rawFile: File
  }[],
}))

export function ImagesPreview() {
  const { images } = useImages()
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex] ?? images[0]

  useKeyDown((e) => {
    if (e.key === 'ArrowLeft' && !isInputting(e)) {
      e.preventDefault()
      setActiveIndex((i) => clamp(i - 1, 0, images.length - 1))
    }
    if (e.key === 'ArrowRight' && !isInputting(e)) {
      e.preventDefault()
      setActiveIndex((i) => clamp(i + 1, 0, images.length - 1))
    }
  })

  useListen(activeIndex, () => {
    document.getElementById(`to-gif-image-${activeIndex}`)?.scrollIntoView({
      behavior: 'smooth',
      inline: 'nearest',
      block: 'nearest',
    })
  })

  return (
    <Box
      sx={{
        display: images.length === 0 ? 'none' : 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <DefaultHeaderShim />
      <Box sx={{ width: '100%', p: 1 }}>
        <Button
          variant='contained'
          onClick={async () => {
            const { width: w, height: h } = images[0]
            const ffmpeg = getFFmpeg()
            // TODO: 管理 log
            ffmpeg.on('log', (data) => {
              console.log('ffmpeg log: ', data)
            })
            await ffmpeg.createDir('images')
            await Promise.all(
              images.map(async (img, i) =>
                ffmpeg.writeFile(
                  `images/${i}.jpg`,
                  new Uint8Array(await img.rawFile.arrayBuffer())
                )
              )
            )
            await ffmpeg.exec([
              '-framerate',
              '2',
              '-i',
              'images/%d.jpg',
              '-vf',
              `scale=w=${w}:h=${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color='#000000'`,
              'output.gif',
            ])
            const data = await ffmpeg.readFile('output.gif')
            const url = URL.createObjectURL(
              new Blob([(data as Uint8Array).buffer], { type: 'image/gif' })
            )
            const a = document.createElement('a')
            a.setAttribute('download', 'output.gif')
            a.setAttribute('href', url)
            a.setAttribute('target', '_blank')
            a.click()
          }}
        >
          转为 gif
        </Button>
      </Box>
      <Divider sx={{ width: '100%' }} />
      {activeImage && (
        <Image
          unoptimized
          src={activeImage.url}
          alt={`图片 ${activeIndex + 1}`}
          className='w-full h-[0] flex-shrink-1 flex-grow-1 object-contain p-1 bg-[#00000016] dark:bg-[#ffffff16]'
          width={activeImage.width}
          height={activeImage.height}
        />
      )}

      <Divider sx={{ width: '100%' }} />
      <Box
        sx={{
          whiteSpace: 'nowrap',
          overflowX: 'auto',
          width: '100%',
          flexShrink: 0,
          p: 1,
        }}
      >
        {images.map((image, index) => (
          <Image
            key={image.url}
            unoptimized
            src={image.url}
            id={`to-gif-image-${index}`}
            alt={`图片 ${activeIndex + 1}`}
            width={image.width}
            height={image.height}
            className={clsx(
              'w-[150px] h-[150px] object-contain inline-block p-1 border cursor-pointer',
              activeIndex === index && 'border-blue-500',
              activeIndex !== index && 'hover:border-blue-300'
            )}
            onClick={() => {
              setActiveIndex(index)
            }}
          />
        ))}
      </Box>
    </Box>
  )
}
