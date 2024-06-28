'use client'

import {
  allMajors,
  allYears,
  all批次,
  all计划性质,
  all高校,
  getColor批次,
} from './constants'

import { MultiSelect } from '@/app/admin/blog/components/TagsSelect'

import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
  styled,
} from '@mui/material'
import { useMemo, useState } from 'react'

import type json from './gk.json'

type DataItem = (typeof json)[0]

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}))

export function GkTable({ data }: { data: DataItem[] }) {
  const [orderBy, setOrderBy] = useState<'录取最低排名' | '录取人数'>(
    '录取最低排名'
  )
  const [order, setOrder] = useState<'asc' | 'desc' | false>(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [selectedSchools, setSelectedSchools] = useState<string[]>([])
  const [selectedYears, setSelectedYears] = useState<string[]>(allYears)
  const [selected专业, setSelected专业] = useState<string[]>([])
  const [selected批次, setSelected批次] = useState<string[]>([])
  const [selected计划性质, setSelected计划性质] = useState<string[]>([])

  const finalData = useMemo(() => {
    const filteredData = [...data].filter(
      (item) =>
        selectedYears.includes(item.年份) &&
        (selected计划性质.length > 0
          ? selected计划性质.includes(item.计划性质名称)
          : true) &&
        (selected批次.length > 0
          ? selected批次.includes(item.批次名称)
          : true) &&
        (selectedSchools.length > 0
          ? selectedSchools.includes(item.高校名称)
          : true) &&
        (selected专业.length > 0 ? selected专业.includes(item.专业名称) : true)
    )
    const sortedData = filteredData.sort((a, b) => {
      if (order === 'asc') {
        return a[orderBy] - b[orderBy]
      }
      if (order === 'desc') {
        return b[orderBy] - a[orderBy]
      }
      return 0
    })
    return sortedData
  }, [
    data,
    selectedYears,
    selected计划性质,
    selected批次,
    selectedSchools,
    selected专业,
    order,
    orderBy,
  ])

  const pagination = (
    <TablePagination
      rowsPerPageOptions={[10, 20, 50, 100]}
      component='div'
      labelRowsPerPage='每页显示'
      count={finalData.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={(_, newPage) => setPage(newPage)}
      onRowsPerPageChange={(e) => setRowsPerPage(+e.target.value)}
    />
  )

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Stack direction='row' spacing='4px' useFlexGap flexWrap='wrap'>
          {allYears.map((item) => (
            <Button
              key={item}
              size='small'
              sx={{ ml: 1 }}
              variant={selectedYears.includes(item) ? 'contained' : 'outlined'}
              onClick={() => {
                setSelectedYears((prev) => {
                  if (prev.includes(item)) {
                    return prev.filter((i) => i !== item)
                  }
                  return [...prev, item]
                })
              }}
            >
              {item}
            </Button>
          ))}
        </Stack>
      </Paper>
      <Paper sx={{ p: 2, mt: 2 }}>
        <MultiSelect
          label='批次'
          selectedList={selected批次}
          selectList={all批次.map((t) => ({
            label: t,
            value: t,
          }))}
          onChange={(selected) => setSelected批次(selected as string[])}
        />
      </Paper>
      <Paper sx={{ p: 2, mt: 2 }}>
        <MultiSelect
          label='计划性质【统招 / 定向】'
          selectedList={selected计划性质}
          selectList={all计划性质.map((t) => ({
            label: t,
            value: t,
          }))}
          onChange={(selected) => setSelected计划性质(selected as string[])}
        />
      </Paper>
      <Paper sx={{ p: 2, mt: 2 }}>
        <MultiSelect
          label='学校'
          selectedList={selectedSchools}
          selectList={all高校.map((t) => ({
            label: t,
            value: t,
          }))}
          onChange={(selected) => setSelectedSchools(selected as string[])}
        />
      </Paper>
      <Paper sx={{ p: 2, mt: 2 }}>
        <MultiSelect
          label='专业'
          selectedList={selected专业}
          selectList={allMajors.map((t) => ({
            label: t,
            value: t,
          }))}
          onChange={(selected) => setSelected专业(selected as string[])}
        />
      </Paper>
      <Paper sx={{ mt: 2 }}>
        {pagination}
        <TableContainer>
          <Table size='small'>
            <TableHead sx={{ backgroundColor: '#dceeff' }}>
              <TableRow>
                <TableCell sx={{ py: 2 }}>学校</TableCell>
                <TableCell>专业</TableCell>
                {selectedYears.length > 1 && <TableCell>年份</TableCell>}
                <TableCell
                  sortDirection={orderBy === '录取最低排名' ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === '录取最低排名' && order !== false}
                    direction={order || 'asc'}
                    onClick={() => {
                      setOrderBy('录取最低排名')
                      setOrder((prev) => {
                        switch (prev) {
                          case 'asc':
                            return false
                          case 'desc':
                            return 'asc'
                          default:
                            return 'desc'
                        }
                      })
                    }}
                  >
                    最低分 / 最低排名
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sortDirection={orderBy === '录取人数' ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === '录取人数' && order !== false}
                    direction={order || 'asc'}
                    onClick={() => {
                      setOrderBy('录取人数')
                      setOrder((prev) => {
                        switch (prev) {
                          case 'asc':
                            return false
                          case 'desc':
                            return 'asc'
                          default:
                            return 'desc'
                        }
                      })
                    }}
                  >
                    录取人数
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {finalData
                .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                .map((item) => (
                  <StyledTableRow key={item.编号}>
                    <TableCell>
                      <p>{item.高校名称}</p>
                      <Typography
                        sx={{
                          color: getColor批次(item.批次名称),
                        }}
                      >
                        {item.批次名称}（{item.计划性质名称}）
                      </Typography>
                    </TableCell>
                    <TableCell>{item.专业名称}</TableCell>
                    {selectedYears.length > 1 && (
                      <TableCell>{item.年份}</TableCell>
                    )}
                    <TableCell>
                      {item.录取最低分} / {item.录取最低排名}
                    </TableCell>
                    <TableCell>{item.录取人数}</TableCell>
                  </StyledTableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        {pagination}
      </Paper>
    </>
  )
}
