'use client'

import { StatusElem } from '../components/StatusElem'
import { getAllTtsTasks } from '../server'

import { getDeviceId } from '@/utils/device-id'
import { SA, toError } from '@/errors/utils'
import Span from '@/components/Span'
import Anchor from '@/components/Anchor'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  TableCell,
  TableRow,
  Button,
  CircularProgress,
} from '@mui/material'
import useSWR from 'swr'

export default function ListTtsTaskPage() {
  const {
    data: tasks,
    isValidating: loading,
    error: rawError,
  } = useSWR('getAllTtsTasks', async () =>
    getAllTtsTasks({ deviceId: await getDeviceId() }).then(SA.decode)
  )
  const router = useRouter()
  const error = useMemo(
    () => (!rawError ? null : toError(rawError)),
    [rawError]
  )

  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={3} align='center'>
          <Box display='flex' justifyContent='center' alignItems='center'>
            <CircularProgress />
          </Box>
        </TableCell>
      </TableRow>
    )
  }

  if (error) {
    return (
      <TableRow>
        <TableCell colSpan={3} align='center'>
          <Typography color='error'>
            加载 TTS 任务失败: {error.message}
          </Typography>
          <Typography sx={{ mt: 1 }}>
            <Anchor href='/tts'>点此新建</Anchor>
          </Typography>
        </TableCell>
      </TableRow>
    )
  }

  if (!tasks || tasks.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={3} align='center'>
          <Typography color='textSecondary'>
            <Span sx={{ mr: 1 }}>暂无 TTS 任务</Span>
            <Anchor href='/tts'>点此新建</Anchor>
          </Typography>
        </TableCell>
      </TableRow>
    )
  }

  return tasks?.map((task) => (
    <TableRow key={task.hash} hover>
      <TableCell
        sx={{
          width: `min(60vw,500px)`,
        }}
      >
        {task.desc}
      </TableCell>
      <TableCell>
        <StatusElem status={task.status} />
      </TableCell>
      <TableCell>
        <Button
          size='small'
          onClick={() => router.push(`/tts/task/${task.hash}`)}
        >
          查看详情
        </Button>
      </TableCell>
    </TableRow>
  ))
}
