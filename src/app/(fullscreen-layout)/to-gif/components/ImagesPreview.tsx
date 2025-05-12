import { toGif } from './ToGifModal'

import { useImages } from '../store'

import { isInputting, useKeyDown } from '@/hooks/useKey'
import { useListen } from '@/hooks/useListen'
import { DefaultHeaderShim } from '@/layout/DefaultHeader'
import { RawUploader } from '@/app/(default-layout)/upload/components/RawUploader'
import { cat } from '@/errors/catchAndToast'

import { Box, Button, ButtonGroup, Divider, Stack } from '@mui/material'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import LastPageIcon from '@mui/icons-material/LastPage'
import { clsx } from 'clsx'
import { clamp } from 'lodash-es'
import Image from 'next/image'
import { useState } from 'react'

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

  useListen(images.length, (cur, prev = 0) => {
    if (cur > prev) {
      setActiveIndex(cur - 1)
    }
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
      <Stack
        sx={{ width: '100%', p: 1 }}
        direction='row'
        spacing={1}
        alignItems='center'
        justifyContent='space-between'
      >
        <Button variant='outlined' size='small'>
          新增图片
          <RawUploader
            multiple
            accept='image/*'
            onChange={cat(async (files) => useImages.appendImages(files))}
          />
        </Button>
        <ButtonGroup size='small'>
          <Button
            onClick={() => {
              if (activeIndex === 0) {
                return
              }
              // 交换 activeIndex 和 activeIndex - 1 的图片
              const newImages = [...images]
              const temp = newImages[activeIndex]
              newImages[activeIndex] = newImages[activeIndex - 1]
              newImages[activeIndex - 1] = temp
              useImages.setState({ images: newImages })
              setActiveIndex((i) => clamp(i - 1, 0, images.length - 1))
            }}
          >
            <FirstPageIcon />
            左移
          </Button>
          <Button
            size='small'
            variant='contained'
            onClick={async () => {
              await toGif({
                images,
              })
            }}
          >
            转 gif
          </Button>
          <Button
            onClick={() => {
              if (activeIndex >= images.length - 1) {
                return
              }
              // 交换 activeIndex 和 activeIndex + 1 的图片
              const newImages = [...images]
              const temp = newImages[activeIndex]
              newImages[activeIndex] = newImages[activeIndex + 1]
              newImages[activeIndex + 1] = temp
              useImages.setState({ images: newImages })
              setActiveIndex((i) => clamp(i + 1, 0, images.length - 1))
            }}
          >
            右移
            <LastPageIcon />
          </Button>
        </ButtonGroup>
        <Button
          variant='outlined'
          size='small'
          color='error'
          onClick={() => {
            const newImages = [...images]
            newImages.splice(activeIndex, 1)
            useImages.setState({ images: newImages })
            setActiveIndex((i) => clamp(i, 0, newImages.length - 1))
          }}
        >
          删除图片
        </Button>
      </Stack>
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
