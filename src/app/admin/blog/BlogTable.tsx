'use client'

import {
  Alert,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'

import type { ServerResponse } from '@/errors/utils'
import type { Tag, User } from '@prisma/client'

export function BlogTable({
  data: blogs,
  error,
}: ServerResponse<
  {
    title: string
    id: number
    tags: Tag[]
    hash: string
    createdAt: Date
    updatedAt: Date
    creator: User
  }[]
>) {
  if (error) {
    return <Alert severity='error'>{error.message}</Alert>
  }
  return (
    <Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>标题</TableCell>
              <TableCell align='right'>发布时间</TableCell>
              <TableCell align='right'>更新时间</TableCell>
              <TableCell align='right'>标签</TableCell>
              <TableCell align='right'>操作</TableCell>
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
                <TableCell align='right'>
                  {blog.createdAt.toLocaleString()}
                </TableCell>
                <TableCell align='right'>
                  {blog.updatedAt.toLocaleString()}
                </TableCell>
                <TableCell align='right'>
                  {blog.tags.map((tag) => tag.name)}
                </TableCell>
                <TableCell align='right'>
                  <Button size='small' variant='contained'>
                    编辑
                  </Button>
                  <Button size='small' variant='contained' color='error'>
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export function ErrorDesc({ message }: { message: string }) {
  return <Alert severity='error'>{message}</Alert>
}
