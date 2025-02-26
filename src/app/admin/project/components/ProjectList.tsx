import { deleteProject, getAllProjects, resumeProject } from '@I/project/server'
import SvgLoading from '@/svg/assets/loading.svg?icon'
import { formatTime } from '@/utils/transformer'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { cat } from '@/errors/catchAndToast'
import { customConfirm } from '@/utils/customConfirm'
import { SA } from '@/errors/utils'
import { AuthRequired } from '@/components/AuthRequired'
import Anchor from '@/components/Anchor'
import { obj } from '@/utils/tiny'

import useSWR from 'swr'
import {
  ButtonGroup,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material'

export function ProjectEditList() {
  const theme = useTheme()
  const {
    data: projects = [],
    isValidating,
    mutate,
  } = useSWR('getAllProjects', () => getAllProjects().then(SA.decode))
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label='simple table'>
        <TableHead>
          <TableRow>
            <TableCell>项目名称</TableCell>
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
          {!isValidating && projects.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} sx={{ textAlign: 'center' }}>
                暂无数据
              </TableCell>
            </TableRow>
          )}
          {projects.map((project) => (
            <TableRow
              key={project.hash}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component='th' scope='row'>
                <Anchor
                  href={`/project/${project.hash}`}
                  target='_blank'
                  style={obj(
                    project.deleted && {
                      color: theme.palette.error.main,
                      textDecoration: 'line-through',
                    }
                  )}
                >
                  {project.name}
                </Anchor>
              </TableCell>
              <TableCell>{formatTime(project.createdAt)}</TableCell>
              <TableCell>
                <AuthRequired roles={['ADMIN']}>
                  <ButtonGroup>
                    <CustomLoadingButton
                      disabled={!project.deleted}
                      variant='contained'
                      onClick={cat(async () => {
                        await resumeProject({ hash: project.hash }).then(
                          SA.decode
                        )
                        await mutate()
                      })}
                    >
                      恢复
                    </CustomLoadingButton>
                    <CustomLoadingButton
                      disabled={project.deleted}
                      color='error'
                      variant='contained'
                      onClick={cat(async () => {
                        if (
                          await customConfirm(
                            `你确定删除项目【${project.name}】吗？`,
                            'SLIGHT'
                          )
                        ) {
                          await deleteProject({ hash: project.hash }).then(
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
  )
}
