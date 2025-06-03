/*
 * TTS任务列表页面
 * 展示所有TTS任务，支持跳转到详情页
 * 数据通过server action获取，UI使用MUI
 */
'use client'

import { StatusElem } from './StatusElem'

import { getAllTtsTasks } from '../server'

import { getDeviceId } from '@/utils/device-id'
import { SA, toError } from '@/errors/utils'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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

  return (
    <Box>
      <Typography
        variant='h5'
        sx={{ textAlign: 'center', fontWeight: 'bold', mb: 2 }}
      >
        TTS任务列表
      </Typography>
      {loading ? (
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight={200}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color='error'>{error.message}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>简介</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks?.map((task) => (
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
