import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import { Autocomplete, Checkbox, Chip, TextField } from '@mui/material'

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
  selectedList: T[]
  onChange?: (selected: T[]) => void
  onNoMatch?: (s: string) => void
}

export function MultiSelect<T extends string | number>({
  selectList,
  selectedList,
  onChange,
  onNoMatch,
  ref,
  ...restProps
}: MultiSelectProps<T>) {
  return (
    <Autocomplete
      ref={ref}
      multiple
      options={selectList}
      value={selectList.filter((item) => selectedList.includes(item.value))}
      disableCloseOnSelect
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      renderOption={(props, option, { selected }) => (
        <li {...props} key={option.value}>
          <Checkbox
            key={option.value}
            icon={icon}
            checkedIcon={checkedIcon}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option.label}
        </li>
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.value}
            label={option.label}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          {...restProps}
          slotProps={{
            htmlInput: {
              ...params.inputProps,
              enterKeyHint: 'enter',
              ...restProps.inputProps,
            },
          }}
        />
      )}
      onChange={(e, _selectedList) => {
        onChange?.(_selectedList.map(({ value }) => value))
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
