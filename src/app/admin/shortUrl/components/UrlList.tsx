import { editShortUrl } from './EditUrl'

import { deleteShortUrls } from '../server'

import { formatTime } from '@/utils/transformer'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { cat } from '@/errors/catchAndToast'
import { customConfirm } from '@/utils/customConfirm'
import { SA } from '@/errors/utils'
import { AuthRequired } from '@/components/AuthRequired'
import { RoleNameMap } from '@/constants'
import { resolvePath } from '@/utils/url'
import { copyToClipboard } from '@/utils/copyToClipboard'
import Span from '@/components/Span'

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
              <TableCell>描述</TableCell>
              <AuthRequired roles={['ADMIN']}>
                <TableCell>作者</TableCell>
              </AuthRequired>
              <TableCell>目标链接</TableCell>
              <TableCell>可访问次数</TableCell>
              <TableCell>过期时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {urls.map((url) => (
              <TableRow
                key={url.hash}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell
                  component='th'
                  scope='row'
                  sx={{ cursor: 'copy', wordBreak: 'break-all' }}
                  onClick={() =>
                    copyToClipboard(resolvePath(`/u/${url.hash}`).href)
                  }
                >
                  {url.encrypt && (
                    <Span
                      sx={{
                        color: 'success.main',
                        fontWeight: 'bold',
                      }}
                    >
                      [已加密]
                    </Span>
                  )}{' '}
                  {resolvePath(`/u/${url.hash}`).href}
                </TableCell>
                <TableCell>{url.description}</TableCell>
                <AuthRequired roles={['ADMIN']}>
                  <TableCell>
                    [{RoleNameMap[url.creator.role]}]{url.creator.name}
                  </TableCell>
                </AuthRequired>
                <TableCell
                  component='th'
                  scope='row'
                  sx={{
                    cursor: 'copy',
                    wordBreak: 'break-all',
                  }}
                  onClick={() => copyToClipboard(url.url)}
                >
                  {url.url}
                </TableCell>
                <TableCell>{url.limit}</TableCell>
                <TableCell>{formatTime(url.timeout)}</TableCell>
                <TableCell>
                  <ButtonGroup>
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
