import { editBlog } from './EditBlog'
import { BlogTypeMap } from './constants'

import { deleteBlogs } from '../server'

import { formatTime } from '@/utils/formatTime'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { cat } from '@/errors/catchAndToast'
import { customConfirm } from '@/utils/customConfirm'
import { SA } from '@/errors/utils'
import Anchor from '@/components/Anchor'
import { AuthRequired } from '@/components/AuthRequired'
import { RoleNameMap } from '@/constants'

import {
  ButtonGroup,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'

import type { Blogs } from './SearchBar'

export function BlogEditorBlogList({
  blogs,
  onChange,
}: {
  blogs: Blogs
  onChange: () => void
}) {
  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>标题</TableCell>
              <AuthRequired roles={['ADMIN']}>
                <TableCell>作者</TableCell>
              </AuthRequired>
              <TableCell>标签</TableCell>
              <TableCell>更新时间</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blogs.map((blog) => (
              <TableRow
                key={blog.title}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component='th' scope='row'>
                  <Anchor href={`/blog/${blog.hash}`}>
                    <Tooltip title={blog.description}>
                      <Typography component='span'>
                        {BlogTypeMap[blog.type].name} {blog.title}
                      </Typography>
                    </Tooltip>
                  </Anchor>
                </TableCell>
                <AuthRequired roles={['ADMIN']}>
                  <TableCell>
                    [{RoleNameMap[blog.creator.role]}]{blog.creator.name}
                  </TableCell>
                </AuthRequired>
                <TableCell>
                  <Stack spacing={1} direction='row' useFlexGap flexWrap='wrap'>
                    {blog.tags.map((tag) => (
                      <Tooltip key={tag.hash} title={tag.description}>
                        <Chip label={tag.name} />
                      </Tooltip>
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>{formatTime(blog.updatedAt)}</TableCell>
                <TableCell>{formatTime(blog.createdAt)}</TableCell>
                <TableCell>
                  <ButtonGroup size='small'>
                    <CustomLoadingButton
                      variant='contained'
                      onClick={cat(async () => {
                        await editBlog(blog)
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
                          !blog.content ||
                          (await customConfirm(
                            `你确定删除博文【${blog.title}】吗？`
                          ))
                        ) {
                          await deleteBlogs([blog.hash]).then(SA.decode)
                          onChange()
                        }
                      })}
                    >
                      删除
                    </CustomLoadingButton>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}
