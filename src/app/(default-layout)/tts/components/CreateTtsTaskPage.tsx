/*
 * 新建TTS任务页面
 * 支持默认配置和多个发言，每个发言可单独配置发声人、音量、语速、声调
 * 使用MUI组件，server action提交
 */
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

import { cat } from '@/errors/catchAndToast'
import { getDeviceId } from '@/utils/device-id'
import { SA } from '@/errors/utils'
import Anchor from '@/components/Anchor'

import { useLoading } from '@zimi/hooks'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import React from 'react'
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
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { useRouter } from 'next/navigation'
import { noop } from 'lodash-es'

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

export default function TtsTaskCreatePage() {
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
                {voices.map((v) => (
                  <MenuItem key={v.voice} value={v.voice}>
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
          <Stack direction='row' spacing={2} mb={1} useFlexGap flexWrap='wrap'>
            <FormControl sx={{ minWidth: 120, flexGrow: 1 }}>
              <InputLabel>发声人</InputLabel>
              <Controller
                name={`speeches.${idx}.voice`}
                control={control}
                render={({ field }) => (
                  <Select {...field} label='发声人' size='small'>
                    <MenuItem value=''>未选择</MenuItem>
                    {voices.map((v) => (
                      <MenuItem key={v.voice} value={v.voice}>
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
              render={({ field }) => <ButtonSlider {...field} {...rateProps} />}
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
    </form>
  )
}
