'use client'

import { editMediaCard } from './EditMediaCard'

import { cat } from '@/errors/catchAndToast'
import { SvgLoading } from '@/svg'
import { AuthRequired } from '@/components/AuthRequired'

import { useAudio } from 'react-use'
import {
  Card,
  Box,
  CardContent,
  Typography,
  IconButton,
  CardMedia,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import EditIcon from '@mui/icons-material/Edit'

import type { MediaCardWithUser } from '../server'
import type { LoadingAble } from '@/components/ServerComponent'

export type MediaCardProps = LoadingAble<MediaCardWithUser>

const emptyMedia =
  'https://next-app-storage-04a4aa9a124907-staging.s3.ap-northeast-2.amazonaws.com/public/2023-08-02/wEdkkC_r0Khz.mp3'

export function MediaCardItem(props: MediaCardProps) {
  const [audio, state, controls] = useAudio({
    src: props.audio || emptyMedia,
    autoPlay: false,
  })
  if (props.loading) {
    return (
      <Card sx={{ display: 'flex' }}>
        <CardMedia
          component='div'
          sx={{
            width: 151,
            height: 151,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <SvgLoading className='animate-spin' />
        </CardMedia>
      </Card>
    )
  }
  return (
    <Card sx={{ display: 'flex', position: 'relative' }}>
      <CardMedia
        component='img'
        sx={{
          width: 151,
          height: 151,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        image={props.image}
        alt={props.title}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component='div' variant='h5'>
            {props.title}
          </Typography>
          <Typography
            variant='subtitle1'
            color='text.secondary'
            component='div'
          >
            {props.description}
          </Typography>
        </CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
          <Box
            sx={{
              opacity: 0,
              pointerEvents: 'none',
              width: 0,
              height: 0,
              overflow: 'hidden',
            }}
          >
            {audio}
          </Box>
          {props.audio && (
            <IconButton
              aria-label='play/pause'
              onClick={() => {
                if (state.paused) {
                  controls.play()
                } else {
                  controls.pause()
                }
              }}
            >
              {state.paused ? (
                <PlayArrowIcon sx={{ height: 38, width: 38 }} />
              ) : (
                <PauseIcon sx={{ height: 38, width: 38 }} />
              )}
            </IconButton>
          )}
        </Box>
      </Box>
      <AuthRequired silence roles={['ADMIN']}>
        <IconButton
          aria-label='edit'
          sx={{ position: 'absolute', right: 0, top: 0 }}
          onClick={cat(async () => {
            await editMediaCard(props)
          })}
        >
          <EditIcon />
        </IconButton>
      </AuthRequired>
    </Card>
  )
}

export function MediaCardUploadTrigger() {
  return (
    <Card
      sx={{ display: 'flex' }}
      onClick={cat(async () => {
        await editMediaCard({
          type: 'FRUIT',
        })
      })}
    >
      <CardMedia
        component='div'
        sx={{
          width: 151,
          height: 151,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component='div' variant='h5'>
            立即上传
          </Typography>
        </CardContent>
      </Box>
    </Card>
  )
}
