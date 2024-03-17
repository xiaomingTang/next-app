'use client'

import { AddressSelector } from './AddressSelector'
import { BirthdaySelector } from './BirthdaySelector'

import { generateRandomUser } from '../server/id'
import { generateRandomName } from '../server/name'

import { SA, toPlainError } from '@/errors/utils'
import { cat } from '@/errors/catchAndToast'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { useLoading } from '@/hooks/useLoading'
import Anchor from '@/components/Anchor'
import { triggerMenuItemEvents } from '@/utils/triggerMenuItemEvents'
import { useUser } from '@/user'
import { Delay } from '@/components/Delay'

import { useState } from 'react'
import {
  Box,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import useSWR from 'swr'
import { useLocalStorage } from 'react-use'

import type { RandomUserRet } from '../server/id'
import type { SxProps } from '@mui/material'
import type { FormProps, Gender, GenderText } from '../server/constants'

const GENDER_MAP: Record<GenderText, Gender | undefined> = {
  随机: undefined,
  男: 'male',
  女: 'female',
}

const GENDER_TO_LABEL_MAP: Record<Gender, GenderText> = {
  male: '男',
  female: '女',
}

const genderList: GenderText[] = ['随机', '男', '女']

function RandomName({ gender }: { gender?: Gender }) {
  const {
    data: name = '',
    isValidating,
    error,
    mutate,
  } = useSWR(['generateRandomName', gender], () =>
    generateRandomName({ count: 1, gender })
      .then(SA.decode)
      .then((res) => res[0])
  )
  return (
    <Anchor
      {...triggerMenuItemEvents((e, reason) => {
        if (reason !== 'middleClick') {
          void mutate(name)
        }
      })}
      bold={false}
    >
      <Typography
        component='span'
        sx={{ userSelect: 'none', color: 'primary' }}
      >
        [点击重新随机]{` `}
      </Typography>
      {name}
      {error && ` - ${toPlainError(error).message}`}
      {isValidating && <Delay delayMs={500}> - 加载中</Delay>}
    </Anchor>
  )
}

const formSx: SxProps = { width: '100%' }

export function CidForm() {
  const user = useUser()
  const [usageHistory = [], setUsageHistory] = useLocalStorage(
    '生成身份证使用记录',
    [] as number[]
  )
  const [fakeUserList, setFakeUserList] = useState<RandomUserRet[]>([])
  const form = useForm<FormProps>({
    defaultValues: {
      gender: '随机',
      year: -1,
      month: -1,
      date: -1,
    },
  })
  const { handleSubmit, control } = form

  const [submitLoading, withSubmitLoading] = useLoading()
  const onSubmit = handleSubmit(
    cat(
      withSubmitLoading(async (e) => {
        if (!user.id) {
          const MAX_COUNT = 5
          const prevUsageHistory = usageHistory.filter(
            (item) => item && item > Date.now() - 60 * 60 * 1000
          )
          // 一小时最多使用 5 次
          if (prevUsageHistory.length >= MAX_COUNT) {
            throw new Error(`已超过合理使用范围（1 小时 ${MAX_COUNT} 次）`)
          }
          setUsageHistory([...prevUsageHistory, Date.now()])
        }
        const list = await generateRandomUser({
          ...e,
          gender: e.gender && GENDER_MAP[e.gender],
          year: e.year < 0 ? undefined : e.year,
          month: e.month < 0 ? undefined : e.month,
          date: e.date < 0 ? undefined : e.date,
        }).then(SA.decode)
        setFakeUserList(list)
      })
    )
  )

  const genderElem = (
    <Controller
      name='gender'
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl error={!!error} sx={formSx}>
          <InputLabel>性别</InputLabel>
          <Select {...field} input={<OutlinedInput label='性别' />}>
            {genderList.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{error?.message ?? ' '}</FormHelperText>
        </FormControl>
      )}
    />
  )

  const submitElem = (
    <CustomLoadingButton
      type='submit'
      loading={submitLoading}
      variant='contained'
      sx={formSx}
    >
      获取随机虚假信息
    </CustomLoadingButton>
  )

  return (
    <Box component={'form'} onSubmit={onSubmit}>
      <AddressSelector form={form} />
      <Grid container spacing={1}>
        <BirthdaySelector form={form} />
        <Grid item xs={12} sm={6} md={4}>
          {genderElem}
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={6} md={4}>
          {submitElem}
        </Grid>
      </Grid>
      <Stack spacing={2} mt={2}>
        {fakeUserList.map((item) => (
          <Box key={item.id}>
            <Typography>
              姓名: <RandomName gender={item.gender} />
            </Typography>
            <Typography>{`性别: ${
              GENDER_TO_LABEL_MAP[item.gender]
            }`}</Typography>
            <Typography>{`地址: ${item.province.name} ${item.city.name} ${item.area.name}`}</Typography>
            <Typography>{`出生日期: ${item.birthday.getFullYear()}-${(
              item.birthday.getMonth() + 1
            )
              .toString()
              .padStart(2, '0')}-${item.birthday
              .getDate()
              .toString()
              .padStart(2, '0')}`}</Typography>
            <Typography>{`身份证号: ${item.id}`}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
