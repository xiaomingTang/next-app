'use client'

import { useEditBlog } from './EditBlog'
import { deleteBlogs } from './server'

import { formatTime } from '@/utils/formatTime'
import { useLoading } from '@/hooks/useLoading'
import { cat } from '@/errors/catchAndToast'
import { customConfirm } from '@/utils/customConfirm'

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
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useRouter } from 'next/navigation'

import type { Blogs } from './SearchBar'

export function BlogEditorBlogList({ blogs }: { blogs: Blogs }) {
  const { elem, edit } = useEditBlog()
  const { loading: editLoading, withLoading: withEditLoading } = useLoading()
  const { loading: deleteLoading, withLoading: withDeleteLoading } =
    useLoading()
  const router = useRouter()
  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>标题</TableCell>
              <TableCell>发布时间</TableCell>
              <TableCell>更新时间</TableCell>
              <TableCell>标签</TableCell>
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
                  {blog.title}
                </TableCell>
                <TableCell>{formatTime(blog.createdAt)}</TableCell>
                <TableCell>{formatTime(blog.updatedAt)}</TableCell>
                <TableCell>
                  <Stack spacing={1} direction='row'>
                    {blog.tags.map((tag) => (
                      <Tooltip
                        key={tag.hash}
                        title={tag.description}
                        placement='bottom-start'
                      >
                        <Chip label={tag.name} />
                      </Tooltip>
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <ButtonGroup size='small'>
                    <LoadingButton
                      loading={editLoading}
                      variant='contained'
                      onClick={withEditLoading(
                        cat(async () => {
                          await edit(blog.hash)
                          // @TODO refresh not working
                          router.refresh()
                        })
                      )}
                    >
                      编辑
                    </LoadingButton>
                    <LoadingButton
                      color='error'
                      loading={deleteLoading}
                      variant='contained'
                      onClick={withDeleteLoading(
                        cat(async () => {
                          if (
                            await customConfirm(
                              `你确定删除博文【${blog.title}】吗？`
                            )
                          ) {
                            await deleteBlogs([blog.hash])
                            // @TODO refresh not working
                            router.refresh()
                          }
                        })
                      )}
                    >
                      删除
                    </LoadingButton>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {elem}
    </>
  )
}
