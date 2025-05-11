import { useImages } from '../store'

import { RawUploader } from '@/app/(default-layout)/upload/components/RawUploader'
import { cat } from '@/errors/catchAndToast'
import { useGlobalFileCatcherHandler } from '@/layout/components/useGlobalFileCatcherHandler'

import { Box, Button, Grow } from '@mui/material'

import type { ExitableProps } from './Exitable'

export function LoadImages({ exited, onExited }: ExitableProps) {
  const { images } = useImages()

  useGlobalFileCatcherHandler.useUpdateHintText('载入图片')

  useGlobalFileCatcherHandler.useUpdateHandler(
    cat(async (files) => useImages.prependImages(files))
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
            onChange={cat(async (files) => useImages.prependImages(files))}
          />
        </Button>
      </Box>
    </Grow>
  )
}
