'use client'

import { editMediaCard } from './EditMediaCard'

import { cat } from '@/errors/catchAndToast'
import { SvgLoading } from '@/svg'
import { AuthRequired } from '@/components/AuthRequired'
import { useMediaLoading } from '@/hooks/useMediaLoading'
import { useListen } from '@/hooks/useListen'

import { useAudio } from 'react-use'
import {
  Card,
  Box,
  CardContent,
  Typography,
  IconButton,
  CardMedia,
  Button,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import EditIcon from '@mui/icons-material/Edit'
import UploadIcon from '@mui/icons-material/Upload'
import { useMemo } from 'react'

import type { MediaCardType } from '@prisma/client'
import type { MediaCardWithUser } from '../server'
import type { LoadingAble } from '@/components/ServerComponent'

export type MediaCardProps = LoadingAble<MediaCardWithUser>

const emptyMedia =
  'https://next-app-storage-04a4aa9a124907-staging.s3.ap-northeast-2.amazonaws.com/public/2023-08-02/wEdkkC_r0Khz.mp3'

export function MediaCardItem(props: MediaCardProps) {
  const mediaProps = useMemo(
    () => ({
      src: props.audio || emptyMedia,
      autoPlay: false,
    }),
    [props.audio]
  )
  const [audio, state, controls, ref] = useAudio(mediaProps)
  const { loading: mediaLoading, setMedia } = useMediaLoading()

  // 变化才 setMedia
  useListen(ref.current, () => {
    setMedia(ref.current)
  })

  if (props.loading) {
    return (
      <Card
        aria-label='加载中'
        sx={{
          display: 'flex',
          height: 151,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <SvgLoading className='w-[38px] h-[38px] animate-spin opacity-50' />
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
              aria-label='播放/暂停'
              onClick={() => {
                if (state.paused) {
                  // 暂停其他播放器
                  document
                    .querySelectorAll<HTMLAudioElement>('audio')
                    .forEach((elem) => elem.pause())
                  document
                    .querySelectorAll<HTMLVideoElement>('video')
                    .forEach((elem) => elem.pause())
                  // 从头开始
                  controls.seek(0)
                  controls.play()
                } else {
                  controls.pause()
                }
              }}
            >
              {
                // eslint-disable-next-line no-nested-ternary
                state.paused ? (
                  <PlayArrowIcon sx={{ height: 38, width: 38 }} />
                ) : mediaLoading ? (
                  <SvgLoading className='w-[38px] h-[38px] animate-spin opacity-50' />
                ) : (
                  <PauseIcon sx={{ height: 38, width: 38 }} />
                )
              }
            </IconButton>
          )}
        </Box>
      </Box>
      <AuthRequired silence roles={['ADMIN']}>
        <IconButton
          aria-label='编辑'
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

export function MediaCardUploadTrigger({ type }: { type: MediaCardType }) {
  return (
    <Card
      aria-label='立即上传'
      aria-labelledby='立即上传'
      component={Button}
      onClick={cat(async () => {
        await editMediaCard({
          type,
        })
      })}
      sx={{
        display: 'flex',
        width: '100%',
        height: 151,
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '1.2em',
          fontWeight: 'bold',
        }}
      >
        <UploadIcon sx={{ mr: 1 }} />
        <Typography
          component='span'
          sx={{
            fontSize: 'inherit',
            fontWeight: 'inherit',
          }}
        >
          立即上传
        </Typography>
      </Box>
    </Card>
  )
}
