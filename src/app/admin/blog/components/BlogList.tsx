'use client'

import { formatTime } from '@/utils/formatTime'

import {
  Button,
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

import type { Blogs } from './SearchBar'

export function BlogEditorBlogList({ blogs }: { blogs: Blogs }) {
  return (
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
                <ButtonGroup size='small' variant='contained'>
                  <Button>编辑</Button>
                  <Button color='error'>删除</Button>
                </ButtonGroup>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
