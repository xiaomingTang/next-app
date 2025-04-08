import {
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from '@mui/material'
import { range } from 'lodash-es'
import { Controller } from 'react-hook-form'

import type { FormProps } from '../server/constants'
import type { SxProps } from '@mui/material'
import type { UseFormReturn } from 'react-hook-form'

const yearList = [-1, ...range(1949, new Date().getFullYear() + 1, 1)]
const monthList = [-1, ...range(0, 11 + 1, 1)]
const dateList = [-1, ...range(1, 31 + 1, 1)]

const formSx: SxProps = { width: '100%' }

export function BirthdaySelector({ form }: { form: UseFormReturn<FormProps> }) {
  const { control } = form
  return (
    <>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 4,
        }}
      >
        <Controller
          name='year'
          control={control}
          render={({ field, fieldState: { error } }) => (
            <FormControl error={!!error} sx={formSx}>
              <InputLabel>年</InputLabel>
              <Select {...field} input={<OutlinedInput label='年' />}>
                {yearList.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year < 0 ? '随机' : year}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{error?.message ?? ' '}</FormHelperText>
            </FormControl>
          )}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 4,
        }}
      >
        <Controller
          name='month'
          control={control}
          render={({ field, fieldState: { error } }) => (
            <FormControl error={!!error} sx={formSx}>
              <InputLabel>月</InputLabel>
              <Select {...field} input={<OutlinedInput label='月' />}>
                {monthList.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month < 0 ? '随机' : month + 1}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{error?.message ?? ' '}</FormHelperText>
            </FormControl>
          )}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 4,
        }}
      >
        <Controller
          name='date'
          control={control}
          render={({ field, fieldState: { error } }) => (
            <FormControl error={!!error} sx={formSx}>
              <InputLabel>日</InputLabel>
              <Select {...field} input={<OutlinedInput label='日' />}>
                {dateList.map((date) => (
                  <MenuItem key={date} value={date}>
                    {date < 0 ? '随机' : date}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{error?.message ?? ' '}</FormHelperText>
            </FormControl>
          )}
        />
      </Grid>
    </>
  )
}
