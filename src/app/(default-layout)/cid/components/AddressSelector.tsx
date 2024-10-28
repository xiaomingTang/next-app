'use client'

import { getProvince, getProvinceList } from '../server/id'

import { SA, toPlainError } from '@/errors/utils'

import { useMemo, useState } from 'react'
import {
  Autocomplete,
  FormControl,
  FormHelperText,
  Grid2,
  TextField,
} from '@mui/material'
import { Controller } from 'react-hook-form'
import useSWR from 'swr'
import { omit } from 'lodash-es'

import type { FormProps } from '../server/constants'
import type { SxProps } from '@mui/material'
import type { UseFormReturn } from 'react-hook-form'

function isOptionEqualToValue<T>(option: { value: T }, value: { value: T }) {
  return option.value === value.value
}

const formSx: SxProps = { width: '100%' }

export function AddressSelector({ form }: { form: UseFormReturn<FormProps> }) {
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>()
  const [selectedCityCode, setSelectedCityCode] = useState<string>()
  const {
    data: provinceList = [],
    error: fetchProvinceListError,
    isValidating: isLoadingProvinceList,
  } = useSWR('getProvinceList', () => getProvinceList().then(SA.decode))

  const {
    data: province,
    error: fetchProvinceError,
    isValidating: isLoadingProvince,
  } = useSWR(['getProvince', selectedProvinceCode], () => {
    const code = selectedProvinceCode
    if (!code) {
      return undefined
    }
    return getProvince(selectedProvinceCode).then(SA.decode)
  })

  const { control, setValue } = form

  const areaLabels = useMemo(() => {
    const city = (province?.children ?? []).find(
      (item) => item.city === selectedCityCode
    )
    if (!city?.children || city.children.length === 0) {
      return []
    }
    return city.children.map((item) => ({
      label: item.name,
      value: item.area || '00',
    }))
  }, [province?.children, selectedCityCode])

  const provinceElem = (
    <Controller
      name='province'
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl
          disabled={isLoadingProvinceList}
          sx={formSx}
          error={!!fetchProvinceListError || !!error}
        >
          <Autocomplete
            disablePortal
            id='province-selector'
            options={provinceList.map((p) => ({
              label: p.name,
              value: p.province,
            }))}
            isOptionEqualToValue={isOptionEqualToValue}
            {...omit(field, 'value', 'onChange')}
            onChange={(_, newValue) => {
              const newProvinceCode = newValue?.value
              setSelectedProvinceCode(newProvinceCode)
              setValue('province', newProvinceCode)
              setValue('city', undefined)
              setValue('area', undefined)
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={isLoadingProvinceList ? '省份信息加载中' : '省份'}
              />
            )}
          />

          <FormHelperText>
            {[
              error?.message,
              fetchProvinceListError &&
                toPlainError(fetchProvinceListError).message,
            ]
              .filter(Boolean)
              .join(' + ')}
            &nbsp;
          </FormHelperText>
        </FormControl>
      )}
    />
  )

  const cityElem = (
    <Controller
      name='city'
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl
          disabled={isLoadingProvince}
          sx={formSx}
          error={!!fetchProvinceError || !!error}
        >
          <Autocomplete
            key={province?.code}
            disablePortal
            id='city-selector'
            options={(province?.children ?? []).map((c) => ({
              label: c.name,
              value: c.city,
            }))}
            isOptionEqualToValue={isOptionEqualToValue}
            {...omit(field, 'value', 'onChange')}
            onChange={(_, newValue) => {
              const newCityCode = newValue?.value
              setSelectedCityCode(newCityCode)
              setValue('city', newCityCode)
              setValue('area', undefined)
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={isLoadingProvinceList ? '市级列表加载中' : '市级'}
              />
            )}
          />

          <FormHelperText>
            {[
              error?.message,
              fetchProvinceError && toPlainError(fetchProvinceError).message,
            ]
              .filter(Boolean)
              .join(' + ')}
            &nbsp;
          </FormHelperText>
        </FormControl>
      )}
    />
  )

  const areaElem = (
    <Controller
      name='area'
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl
          disabled={isLoadingProvince || areaLabels.length === 0}
          sx={formSx}
          error={!!fetchProvinceError || !!error}
        >
          <Autocomplete
            key={selectedCityCode}
            disablePortal
            id='area-selector'
            options={areaLabels}
            isOptionEqualToValue={isOptionEqualToValue}
            {...omit(field, 'value', 'onChange')}
            onChange={(_, newValue) => {
              const newCityCode = newValue?.value
              setValue('area', newCityCode)
            }}
            renderInput={(params) => (
              <TextField
                sx={{
                  pointerEvents:
                    isLoadingProvince || areaLabels.length === 0
                      ? 'none'
                      : 'auto',
                }}
                {...params}
                label={isLoadingProvinceList ? '县级列表加载中' : '县级'}
                disabled={isLoadingProvince || areaLabels.length === 0}
              />
            )}
          />

          <FormHelperText>
            {[
              error?.message,
              fetchProvinceError && toPlainError(fetchProvinceError).message,
            ]
              .filter(Boolean)
              .join(' + ')}
            &nbsp;
          </FormHelperText>
        </FormControl>
      )}
    />
  )

  return (
    <Grid2 container spacing={1}>
      <Grid2
        size={{
          xs: 12,
          sm: 6,
          md: 4,
        }}
      >
        {provinceElem}
      </Grid2>
      <Grid2
        size={{
          xs: 12,
          sm: 6,
          md: 4,
        }}
      >
        {cityElem}
      </Grid2>
      <Grid2
        size={{
          xs: 12,
          sm: 6,
          md: 4,
        }}
      >
        {areaElem}
      </Grid2>
    </Grid2>
  )
}
