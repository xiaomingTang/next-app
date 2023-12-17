'use client'

import { generateRandomUser } from './server/id'
import { geneRandomName } from './server/name'

import { cat } from '@/errors/catchAndToast'
import { useLoading } from '@/hooks/useLoading'
import { SA } from '@/errors/utils'

import { useState } from 'react'
import { Box, Stack } from '@mui/material'
import { LoadingButton } from '@mui/lab'

import type { RandomUserRet } from './server/id'

// import { seo } from '@/utils/seo'

// export const metadata = seo.defaults({
//   title: '给你点颜色瞧瞧',
//   description: '演示图片从一个主色调转变为另一个主色调',
// })

export default function Home() {
  const [loading, withLoading] = useLoading()
  const [users, setUsers] = useState<RandomUserRet[]>([])
  const [names, setNames] = useState<string[]>([])
  return (
    <Box>
      <LoadingButton
        loading={loading}
        variant='contained'
        onClick={cat(
          withLoading(async () => {
            setUsers(await generateRandomUser({ count: 5 }).then(SA.decode))
          })
        )}
      >
        随机身份
      </LoadingButton>
      <LoadingButton
        loading={loading}
        variant='contained'
        onClick={cat(
          withLoading(async () => {
            setNames(await geneRandomName({}).then(SA.decode))
          })
        )}
      >
        随机姓名
      </LoadingButton>
      <Stack direction='row' spacing={2} useFlexGap flexWrap='wrap'>
        {names.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </Stack>
      <Stack spacing={2} mt={2}>
        {users.map((item) => (
          <Box key={item.id}>
            <Box>{`地址: ${item.province.name} ${item.city.name} ${item.area.name}`}</Box>
            <Box>{`出生日期: ${item.birthday.getFullYear()}-${(
              item.birthday.getMonth() + 1
            )
              .toString()
              .padStart(2, '0')}-${item.birthday
              .getDate()
              .toString()
              .padStart(2, '0')}`}</Box>
            <Box>{`身份证号: ${item.id}`}</Box>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
