import { editHomepageLink } from './EditHomepageLink'

import { deleteHomepageLinks, getAllHomepageLinks } from '../server'

import SvgLoading from '@/svg/assets/loading.svg?icon'
import { formatTime } from '@/utils/transformer'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { cat } from '@/errors/catchAndToast'
import { customConfirm } from '@/utils/customConfirm'
import { SA } from '@/errors/utils'
import { AuthRequired } from '@/components/AuthRequired'

import {
  Box,
  Button,
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
import useSWR from 'swr'

export function HomepageLinkEditList() {
  const {
    data: homepageLinks = [],
    isValidating,
    mutate,
  } = useSWR('getAllHomepageLinks', () => getAllHomepageLinks().then(SA.decode))
  return (
    <>
      <Box sx={{ py: 1 }}>
        <Button
          variant='contained'
          size='small'
          onClick={cat(async () => {
            await editHomepageLink()
            await mutate()
          })}
        >
          新增
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>链接名称</TableCell>
              <TableCell>跳转地址</TableCell>
              <TableCell>更新时间</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isValidating && (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center' }}>
                  <SvgLoading className='animate-spin inline-block' />
                </TableCell>
              </TableRow>
            )}
            {!isValidating && homepageLinks.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center' }}>
                  暂无数据
                </TableCell>
              </TableRow>
            )}
            {homepageLinks.map((link) => (
              <TableRow
                key={link.hash}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component='th' scope='row'>
                  {link.name}
                </TableCell>
                <TableCell>
                  <Stack direction='row' spacing={1}>
                    {link.url}
                  </Stack>
                </TableCell>
                <TableCell>{formatTime(link.updatedAt)}</TableCell>
                <TableCell>{formatTime(link.createdAt)}</TableCell>
                <TableCell>
                  <AuthRequired roles={['ADMIN']}>
                    <ButtonGroup>
                      <CustomLoadingButton
                        variant='contained'
                        onClick={cat(async () => {
                          await editHomepageLink(link)
                          await mutate()
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
                              `你确定删除首页链接【${link.name}】吗？`
                            )
                          ) {
                            await deleteHomepageLinks([link.hash]).then(
                              SA.decode
                            )
                            await mutate()
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
