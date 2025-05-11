import { useImages } from './ImagesPreview'

import { getImageExtension } from '../utils'

import { RawUploader } from '@/app/(default-layout)/upload/components/RawUploader'
import { cat } from '@/errors/catchAndToast'
import { useGlobalFileCatcherHandler } from '@/layout/components/useGlobalFileCatcherHandler'
import { getImageSize } from '@/utils/getImageSize'
import { getModeOf } from '@/utils/math'

import { Box, Button, Grow } from '@mui/material'

import type { ExitableProps } from './Exitable'

async function setImages(files: File[]) {
  const imageFiles = files.filter((f) => f.type.startsWith('image/'))
  if (imageFiles.length === 0) {
    throw new Error('请选择图片文件')
  }
  const allImagesWithSize = await Promise.all(
    imageFiles.map(async (f) => {
      const url = URL.createObjectURL(f)
      const { width, height } = await getImageSize(url)
      const ext = getImageExtension(f)
      return {
        type: f.type,
        url: URL.createObjectURL(f),
        width,
        height,
        rawFile: f,
        propertyExt: ext,
      }
    })
  )
  if (allImagesWithSize.some((i) => i.propertyExt === 'gif')) {
    throw new Error('不支持 GIF 格式的图片')
  }
  const preferredSize =
    getModeOf(allImagesWithSize, (i) => `${i.width}x${i.height}`) ??
    allImagesWithSize[0]
  if (preferredSize.width <= 0 || preferredSize.height <= 0) {
    throw new Error('图片尺寸必须大于 0')
  }
  useImages.setState({
    images: allImagesWithSize.map((i) => ({
      ...i,
      width: preferredSize.width,
      height: preferredSize.height,
    })),
  })
}

export function LoadImages({ exited, onExited }: ExitableProps) {
  const { images } = useImages()

  useGlobalFileCatcherHandler.useUpdateHintText(
    exited ? '不支持中途添加文件，刷新页面后重试吧。' : '载入图片'
  )

  useGlobalFileCatcherHandler.useUpdateHandler(
    cat(async (files) => {
      if (exited) {
        throw new Error('不支持中途添加文件，刷新页面后重试吧。')
      }
      await setImages(files)
    })
  )

  return (
    <Grow
      appear={false}
      in={images.length === 0}
      onExited={() => onExited(true)}
    >
      <Box
        sx={{
          display: exited ? 'none' : 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Button variant='contained' size='large'>
          载入图片
          <RawUploader
            multiple
            accept='image/*'
            onChange={cat(async (files) => {
              if (exited) {
                throw new Error('不支持中途添加文件，刷新页面后重试吧。')
              }
              await setImages(files)
            })}
          />
        </Button>
      </Box>
    </Grow>
  )
}
