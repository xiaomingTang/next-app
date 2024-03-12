import { editMP3 } from './EditMP3'

import { deleteMP3s } from '../server'

import { formatTime } from '@/utils/transformer'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { cat } from '@/errors/catchAndToast'
import { customConfirm } from '@/utils/customConfirm'
import { SA } from '@/errors/utils'
import { AuthRequired } from '@/components/AuthRequired'
import Anchor from '@/components/Anchor'

import {
  ButtonGroup,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'

import type { CustomMP3 } from '@prisma/client'

export function MP3EditMP3List({
  mp3s,
  onChange,
}: {
  mp3s: CustomMP3[]
  onChange: () => void
}) {
  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>歌名</TableCell>
              <TableCell>源文件</TableCell>
              <TableCell>更新时间</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mp3s.map((mp3) => (
              <TableRow
                key={mp3.hash}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component='th' scope='row'>
                  {mp3.name}
                </TableCell>
                <TableCell>
                  <Stack direction='row' spacing={1}>
                    {mp3.mp3 && <Anchor href={mp3.mp3}>mp3</Anchor>}
                    {mp3.lrc && <Anchor href={mp3.lrc}>lrc</Anchor>}
                  </Stack>
                </TableCell>
                <TableCell>{formatTime(mp3.updatedAt)}</TableCell>
                <TableCell>{formatTime(mp3.createdAt)}</TableCell>
                <TableCell>
                  <AuthRequired roles={['ADMIN']}>
                    <ButtonGroup>
                      <CustomLoadingButton
                        variant='contained'
                        onClick={cat(async () => {
                          await editMP3(mp3)
                          onChange()
                        })}
                      >
                        编辑
                      </CustomLoadingButton>
                      <CustomLoadingButton
                        color='error'
                        variant='contained'
                        onClick={cat(async () => {
                          if (
                            await customConfirm(
                              `你确定删除歌曲【${mp3.name}】吗？`
                            )
                          ) {
                            await deleteMP3s([mp3.hash]).then(SA.decode)
                            onChange()
                          }
                        })}
                      >
                        删除
                      </CustomLoadingButton>
                    </ButtonGroup>
                  </AuthRequired>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}
