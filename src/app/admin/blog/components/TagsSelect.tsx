import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import { Autocomplete, Checkbox, TextField } from '@mui/material'

import type { BaseTextFieldProps } from '@mui/material'

interface SelectableProps<T> {
  label: string
  value: T
}

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />
const checkedIcon = <CheckBoxIcon fontSize='small' />

interface MultiSelectProps<T extends string | number>
  extends BaseTextFieldProps {
  selectList: SelectableProps<T>[]
  defaultSelectedList?: T[]
  onChange?: (selected: T[]) => void
  onNoMatch?: (s: string) => void
}

export function MultiSelect<T extends string | number>({
  selectList,
  defaultSelectedList,
  onChange,
  onNoMatch,
  ...restProps
}: MultiSelectProps<T>) {
  return (
    <Autocomplete
      multiple
      size='small'
      options={selectList}
      defaultValue={selectList.filter((item) =>
        defaultSelectedList?.includes(item.value)
      )}
      disableCloseOnSelect
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      renderOption={(props, option, { selected }) => (
        <li {...props} key={option.value}>
          <Checkbox
            icon={icon}
            checkedIcon={checkedIcon}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option.label}
        </li>
      )}
      renderInput={(params) => <TextField {...params} {...restProps} />}
      onChange={(e, selectedList) => {
        onChange?.(selectedList.map(({ value }) => value))
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          const target = e.target as HTMLInputElement
          setTimeout(() => {
            onNoMatch?.(target?.value)
          }, 100)
        }
      }}
    />
  )
}
