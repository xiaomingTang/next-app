import { toGif } from './ToGifModal'

import { isInputting, useKeyDown } from '@/hooks/useKey'
import { useListen } from '@/hooks/useListen'
import { DefaultHeaderShim } from '@/layout/DefaultHeader'

import { Box, Button, Divider } from '@mui/material'
import { clsx } from 'clsx'
import { clamp } from 'lodash-es'
import Image from 'next/image'
import { useState } from 'react'
import { create } from 'zustand'

export interface ImageInfo {
  type: string
  /**
   * blob url
   * @example blob:https://example.com/12345678-1234-1234-1234-123456789012
   */
  url: string
  width: number
  height: number
  rawFile: File
  /**
   * 综合推断的图片的扩展名
   * （避免用户输入图片的扩展名有误）
   */
  propertyExt: string
}

export const useImages = create(() => ({
  images: [] as ImageInfo[],
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
            await toGif({
              images,
            })
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
