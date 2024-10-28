'use client'

import { getComments } from '@D/comment/server'
import { SA } from '@/errors/utils'
import { formatTime } from '@/utils/transformer'
import { cat } from '@/errors/catchAndToast'
import { obj } from '@/utils/tiny'
import Anchor from '@/components/Anchor'
import SvgLoading from '@/svg/assets/loading.svg?icon'

import useSWR from 'swr'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import {
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { toast } from 'react-hot-toast'
import { useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

import type { Comment } from '@prisma/client'

const SHOULD_COLLAPSE_FLOOR_LIMIT = 100

function Row({ comment }: { comment: Comment }) {
  const shouldCollapse = comment.content.length > SHOULD_COLLAPSE_FLOOR_LIMIT
  const [collapsed, setCollapsed] = useState(true)
  return (
    <>
      <TableRow
        key={comment.hash}
        sx={{
          '&:last-child td, &:last-child th': { border: 0 },
          ...obj(
            shouldCollapse && {
              '& > *': { borderBottom: 'unset' },
              '& > MuiTableCell-root': { borderBottom: 'unset' },
            }
          ),
        }}
      >
        <TableCell>
          {shouldCollapse && (
            <IconButton
              aria-label='expand row'
              size='small'
              onClick={() => setCollapsed((prev) => !prev)}
            >
              {collapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
            </IconButton>
          )}
        </TableCell>
        <TableCell>{formatTime(comment.createdAt)}</TableCell>
        <CopyToClipboard
          text={comment.name}
          onCopy={() => {
            toast.success('复制成功')
          }}
        >
          <TableCell sx={{ cursor: 'copy', wordBreak: 'break-all' }}>
            {comment.name || '-'}
          </TableCell>
        </CopyToClipboard>
        <CopyToClipboard
          text={comment.email}
          onCopy={() => {
            toast.success('复制成功')
          }}
        >
          <TableCell sx={{ cursor: 'copy', wordBreak: 'break-all' }}>
            {comment.email || '-'}
          </TableCell>
        </CopyToClipboard>
        <TableCell
          sx={{
            minWidth: 400,
            maxWidth: 500,
            wordBreak: 'break-all',
            whiteSpace: 'pre-wrap',
          }}
        >
          {comment.content.slice(0, SHOULD_COLLAPSE_FLOOR_LIMIT)}
          {shouldCollapse && (
            <Anchor
              style={{ marginLeft: '0.5em', userSelect: 'none' }}
              onClick={() => setCollapsed((prev) => !prev)}
            >
              {collapsed ? '展开查看全文' : '折叠全文'}
            </Anchor>
          )}
        </TableCell>
      </TableRow>
      {shouldCollapse && (
        <TableRow key={`expended-${comment.hash}`}>
          <TableCell colSpan={5}>
            <Collapse in={!collapsed} timeout='auto'>
              <Typography>{comment.content}</Typography>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export default function CommentViewer() {
  const { data: comments = [], isValidating } = useSWR(
    'getComments',
    cat(() => getComments().then(SA.decode))
  )

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label='simple table'>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>创建时间</TableCell>
            <TableCell>用户</TableCell>
            <TableCell>邮箱</TableCell>
            <TableCell>留言内容</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {comments.map((comment) => (
            <Row key={comment.hash} comment={comment} />
          ))}
          {isValidating && (
            <TableRow>
              <TableCell colSpan={5} sx={{ textAlign: 'center' }}>
                <SvgLoading className='animate-spin inline-block' />
              </TableCell>
            </TableRow>
          )}
          {!isValidating && comments.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} sx={{ textAlign: 'center' }}>
                暂无数据
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
