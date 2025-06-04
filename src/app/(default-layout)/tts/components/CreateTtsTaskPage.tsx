'use client'

import {
  ButtonSlider,
  pitchProps,
  rateProps,
  volumeProps,
} from './ButtonSlider'

import {
  contentCategoriesMap,
  voicePersonalitiesMap,
  voices,
} from '../constants'
import { tts } from '../server'
import { getCdnUrl } from '../../upload/utils/getCdnUrl'
import { getTtsConfig, updateTtsConfig } from '../server/ttsConfig'

import { cat } from '@/errors/catchAndToast'
import { getDeviceId } from '@/utils/device-id'
import { SA } from '@/errors/utils'
import Anchor from '@/components/Anchor'
import { useUser } from '@/user'
import { useAudioPlayer } from '@/hooks/useAudio'

import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import { useLoading } from '@zimi/hooks'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import {
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Divider,
  Stack,
  Chip,
  Paper,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { useRouter } from 'next/navigation'
import { noop } from 'lodash-es'
import useSWR from 'swr'
import toast from 'react-hot-toast'

const voicesWithDemo = voices.map((v) => ({
  ...v,
  demoSrc: getCdnUrl({
    key: `/public/tts-demos/${v.voice}.mp3`,
  }).href,
}))

/*
 * 默认配置类型
 */
interface DefaultConfig {
  voice: string
  volume: number
  rate: number
  pitch: number
}

/*
 * 发言项类型
 */
interface SpeechItem {
  text: string
  voice: string
  volume?: number
  rate?: number
  pitch?: number
}

/*
 * 获取第一个voice作为默认
 */
const defaultVoice = voices[0].voice

const defaultConfigInit: DefaultConfig = {
  voice: defaultVoice,
  volume: 0,
  rate: 0,
  pitch: 0,
}

/*
 * 表单类型
 */
interface FormValues {
  defaultConfig: DefaultConfig
  speeches: SpeechItem[]
}

function AudioPlayerButton({ src }: { src: string }) {
  const { src: curSrc, paused, loading } = useAudioPlayer()
  const isActive = curSrc === src

  return (
    <IconButton
      size='small'
      loading={isActive && loading}
      onClick={async (e) => {
        e.preventDefault()
        e.stopPropagation()
        void useAudioPlayer.play(src).catch(() => {
          toast.error('播放失败，请稍后重试')
        })
      }}
    >
      {isActive && !paused ? <StopIcon /> : <PlayArrowIcon />}
    </IconButton>
  )
}

export default function TtsTaskCreatePage() {
  const user = useUser()
  const { data: ttsConfig, mutate } = useSWR(
    `getTtsConfig-${user.role}`,
    async () => {
      if (user.role === 'ADMIN') {
        return getTtsConfig().then(SA.decode)
      }
      return null
    }
  )
  const router = useRouter()
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      defaultConfig: defaultConfigInit,
      speeches: [
        {
          text: '',
          voice: '',
        },
      ],
    },
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'speeches',
  })
  /* loading hook */
  const [loading, withLoading] = useLoading()

  /* 提交表单 */
  const onSubmit = handleSubmit(
    withLoading(
      cat(async (data) => {
        const { defaultConfig, speeches } = data
        const payload = {
          voice: defaultConfig.voice,
          volume: volumeProps.renderValue(defaultConfig.volume) || '0',
          rate: rateProps.renderValue(defaultConfig.rate) || '0',
          pitch: pitchProps.renderValue(defaultConfig.pitch) || '0',

          deviceId: await getDeviceId(),
          texts: speeches.map((item) => ({
            text: item.text.trim(),
            voice: item.voice.trim() || undefined,
            rate: rateProps.renderValue(item.rate) || undefined,
            volume: volumeProps.renderValue(item.volume) || undefined,
            pitch: pitchProps.renderValue(item.pitch) || undefined,
          })),
        }
        const res = await tts(payload).then(SA.decode)
        router.push(`/tts/task/${res.hash}`)
      })
    )
  )

  return (
    <form onSubmit={onSubmit}>
      <Typography
        variant='h5'
        sx={{ textAlign: 'center', fontWeight: 'bold', mb: 2 }}
      >
        新建“文本转语音”任务
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant='subtitle1' sx={{ mb: 1, fontWeight: 'bold' }}>
          默认配置
        </Typography>
        <Stack direction='row' spacing={2} mb={2} useFlexGap flexWrap='wrap'>
          <FormControl sx={{ minWidth: 120, flexGrow: 1 }}>
            <InputLabel>发声人</InputLabel>
            <Controller
              name='defaultConfig.voice'
              control={control}
              render={({ field }) => (
                <Select {...field} label='发声人' size='small'>
                  {voicesWithDemo.map((v) => (
                    <MenuItem key={v.voice} value={v.voice}>
                      <AudioPlayerButton src={v.demoSrc} />
                      {v.name}
                      {v.contentCategories.map((c) => (
                        <Chip
                          key={c}
                          size='small'
                          color='success'
                          label={contentCategoriesMap[c]}
                          sx={{ ml: 1 }}
                          onClick={noop}
                        />
                      ))}
                      {v.voicePersonalities.map((p) => (
                        <Chip
                          key={p}
                          size='small'
                          color='info'
                          label={voicePersonalitiesMap[p]}
                          sx={{ ml: 1 }}
                          onClick={noop}
                        />
                      ))}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
          <Controller
            name='defaultConfig.volume'
            control={control}
            render={({ field }) => <ButtonSlider {...field} {...volumeProps} />}
          />
          <Controller
            name='defaultConfig.rate'
            control={control}
            render={({ field }) => <ButtonSlider {...field} {...rateProps} />}
          />
          <Controller
            name='defaultConfig.pitch'
            control={control}
            render={({ field }) => <ButtonSlider {...field} {...pitchProps} />}
          />
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant='subtitle1' sx={{ mb: 1, fontWeight: 'bold' }}>
          发言列表
        </Typography>
        {fields.map((item, idx) => (
          <Box key={item.id} mb={2}>
            <Stack
              direction='row'
              spacing={2}
              mb={1}
              useFlexGap
              flexWrap='wrap'
            >
              <FormControl sx={{ minWidth: 120, flexGrow: 1 }}>
                <InputLabel>发声人</InputLabel>
                <Controller
                  name={`speeches.${idx}.voice`}
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label='发声人' size='small'>
                      <MenuItem value=''>未选择</MenuItem>
                      {voicesWithDemo.map((v) => (
                        <MenuItem key={v.voice} value={v.voice}>
                          <AudioPlayerButton src={v.demoSrc} />
                          {v.name}
                          {v.contentCategories.map((c) => (
                            <Chip
                              key={c}
                              size='small'
                              color='success'
                              label={contentCategoriesMap[c]}
                              sx={{ ml: 1 }}
                              onClick={noop}
                            />
                          ))}
                          {v.voicePersonalities.map((p) => (
                            <Chip
                              key={p}
                              size='small'
                              color='info'
                              label={voicePersonalitiesMap[p]}
                              sx={{ ml: 1 }}
                              onClick={noop}
                            />
                          ))}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              <Controller
                name={`speeches.${idx}.volume`}
                control={control}
                render={({ field }) => (
                  <ButtonSlider {...field} {...volumeProps} />
                )}
              />
              <Controller
                name={`speeches.${idx}.rate`}
                control={control}
                render={({ field }) => (
                  <ButtonSlider {...field} {...rateProps} />
                )}
              />
              <Controller
                name={`speeches.${idx}.pitch`}
                control={control}
                render={({ field }) => (
                  <ButtonSlider {...field} {...pitchProps} />
                )}
              />
              <IconButton
                onClick={() => remove(idx)}
                disabled={fields.length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
            <Controller
              name={`speeches.${idx}.text`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  label='文本'
                  error={!!error}
                  helperText={error ? error.message : ' '}
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={10}
                  {...field}
                />
              )}
              rules={{
                required: '文本不能为空',
                validate: (value) => value.trim() !== '' || '文本不能为空',
              }}
            />
          </Box>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            append({
              text: '',
              voice: '',
            })
          }}
          sx={{ mb: 2 }}
        >
          添加发言
        </Button>
        <Box mt={2}>
          <Button
            type='submit'
            variant='contained'
            color='primary'
            disabled={loading}
          >
            提交任务
          </Button>
          <Anchor href='/tts/tasks' tabIndex={-1}>
            <Button variant='text' color='primary' sx={{ ml: 1 }}>
              查看任务列表
            </Button>
          </Anchor>
        </Box>
        {ttsConfig && (
          <>
            <Divider sx={{ my: 2 }} />

            <Box>
              <Button
                variant='outlined'
                color='secondary'
                onClick={cat(() =>
                  updateTtsConfig({
                    ...ttsConfig,
                    enableUser: !ttsConfig.enableUser,
                  })
                    .then(SA.decode)
                    .then(() => mutate())
                )}
              >
                {ttsConfig.enableUser ? '禁止普通用户使用' : '允许普通用户使用'}
              </Button>
              <Button
                variant='outlined'
                color='secondary'
                onClick={cat(() =>
                  updateTtsConfig({
                    ...ttsConfig,
                    enableGuest: !ttsConfig.enableGuest,
                  })
                    .then(SA.decode)
                    .then(() => mutate())
                )}
                sx={{ ml: 1 }}
              >
                {ttsConfig.enableGuest ? '禁止游客使用' : '允许游客使用'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </form>
  )
}
