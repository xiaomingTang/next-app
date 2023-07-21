import { editShortUrl } from './EditUrl'

import { deleteShortUrls } from '../server'

import { formatTime } from '@/utils/formatTime'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { cat } from '@/errors/catchAndToast'
import { customConfirm } from '@/utils/customConfirm'
import { SA } from '@/errors/utils'
import { AuthRequired } from '@/components/AuthRequired'
import { ENV_CONFIG } from '@/config'
import { RoleNameMap } from '@/constants'

import { CopyToClipboard } from 'react-copy-to-clipboard'
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
import { toast } from 'react-hot-toast'

import type { ShortUrlWithCreator } from '../server'

export function UrlEditUrlList({
  urls,
  onChange,
}: {
  urls: ShortUrlWithCreator[]
  onChange: () => void
}) {
  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>短链</TableCell>
              <AuthRequired roles={[Role.ADMIN]}>
                <TableCell>作者</TableCell>
              </AuthRequired>
              <TableCell>目标链接</TableCell>
              <TableCell>更新时间</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {urls.map((url) => (
              <TableRow
                key={url.hash}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <CopyToClipboard
                  text={`${ENV_CONFIG.public.origin}/u/${url.hash}`}
                  onCopy={() => {
                    toast.success('复制成功')
                  }}
                >
                  <TableCell component='th' scope='row' sx={{ cursor: 'copy' }}>
                    {`${ENV_CONFIG.public.origin}/u/${url.hash}`}
                  </TableCell>
                </CopyToClipboard>
                <AuthRequired roles={[Role.ADMIN]}>
                  <TableCell>
                    [{RoleNameMap[url.creator.role]}]{url.creator.name}
                  </TableCell>
                </AuthRequired>
                <CopyToClipboard
                  text={url.url}
                  onCopy={() => {
                    toast.success('复制成功')
                  }}
                >
                  <TableCell component='th' scope='row' sx={{ cursor: 'copy' }}>
                    {url.url}
                  </TableCell>
                </CopyToClipboard>
                <TableCell>{formatTime(url.updatedAt)}</TableCell>
                <TableCell>{formatTime(url.createdAt)}</TableCell>
                <TableCell>
                  <ButtonGroup size='small'>
                    <CustomLoadingButton
                      variant='contained'
                      onClick={cat(async () => {
                        await editShortUrl(url)
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
                            `你确定删除短链【${url.url}】吗？`
                          )
                        ) {
                          await deleteShortUrls([url.hash]).then(SA.decode)
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
