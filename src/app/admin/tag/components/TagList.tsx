import { editTag } from './EditTag'

import { deleteTags } from '../server'

import { formatTime } from '@/utils/formatTime'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { cat } from '@/errors/catchAndToast'
import { customConfirm } from '@/utils/customConfirm'
import { SA } from '@/errors/utils'
import { RoleNameMap } from '@/constants'
import { AuthRequired } from '@/components/AuthRequired'

import {
  ButtonGroup,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { Role } from '@prisma/client'

import type { TagWithCreator } from '../server'

export function TagEditTagList({
  tags,
  onChange,
}: {
  tags: TagWithCreator[]
  onChange: () => void
}) {
  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>标签名</TableCell>
              <TableCell>作者</TableCell>
              <TableCell>描述</TableCell>
              <TableCell>更新时间</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tags.map((tag) => (
              <TableRow
                key={tag.hash}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component='th' scope='row'>
                  {tag.name}
                </TableCell>
                <TableCell>
                  [{RoleNameMap[tag.creator.role]}]{tag.creator.name}
                </TableCell>
                <TableCell component='th' scope='row'>
                  {tag.description}
                </TableCell>
                <TableCell>{formatTime(tag.updatedAt)}</TableCell>
                <TableCell>{formatTime(tag.createdAt)}</TableCell>
                <TableCell>
                  <AuthRequired roles={[Role.ADMIN]} userIds={[tag.creatorId]}>
                    <ButtonGroup size='small'>
                      <CustomLoadingButton
                        variant='contained'
                        onClick={cat(async () => {
                          await editTag(tag)
                          onChange()
                        })}
                      >
                        编辑
                      </CustomLoadingButton>
                      <CustomLoadingButton
                        color='error'
                        variant='contained'
                        onClick={cat(async () => {
                          const blogLen = tag._count.blogs
                          if (
                            blogLen === 0 ||
                            (await customConfirm(
                              `你确定删除标签【${tag.name}】吗？它已经有 ${blogLen} 篇博客了哦`
                            ))
                          ) {
                            await deleteTags([tag.hash]).then(SA.decode)
                            onChange()
                          }
                        })}
                      >
                        删除 ({tag._count.blogs})
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
