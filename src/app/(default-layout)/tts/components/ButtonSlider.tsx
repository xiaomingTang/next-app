import { AnchorProvider } from '@/components/AnchorProvider'

import { Button, ClickAwayListener, Popper, Slider } from '@mui/material'

interface ButtonSliderProps {
  value?: number
  onChange: (value: number) => void
  renderValue: (value?: number) => string
  renderLabel: (value?: number) => string
  min: number
  max: number
  step: number
}

function r(n: number | string | undefined | null, suffix: string) {
  if (n === undefined || n === null || n === '') {
    return ''
  }
  return +n >= 0 ? `+${n}${suffix}` : `${n}${suffix}`
}

export const volumeProps: Omit<ButtonSliderProps, 'value' | 'onChange'> = {
  renderValue: (value) => r(value, '%'),
  renderLabel: (value) => `音量${r(value, '%')}`,
  min: -50,
  max: 50,
  step: 10,
}

export const rateProps: Omit<ButtonSliderProps, 'value' | 'onChange'> = {
  renderValue: (value) => `${r(value, '%')}`,
  renderLabel: (value) => `语速${r(value, '%')}`,
  min: -50,
  max: 50,
  step: 10,
}

export const pitchProps: Omit<ButtonSliderProps, 'value' | 'onChange'> = {
  renderValue: (value) => `${r(value, 'Hz')}`,
  renderLabel: (value) => `音调${r(value, 'Hz')}`,
  min: -20,
  max: 20,
  step: 2,
}

export function ButtonSlider({
  value,
  onChange,
  renderValue,
  renderLabel,
  min,
  max,
  step,
}: ButtonSliderProps) {
  return (
    <AnchorProvider>
      {(anchorEl, setAnchorEl) => (
        <>
          <Button
            variant='text'
            size='small'
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            {renderLabel ? renderLabel(value) : value}
          </Button>
          <Popper anchorEl={anchorEl} open={Boolean(anchorEl)} placement='top'>
            <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
              <Slider
                // 防止传入 undefined 导致变成非受控组件
                value={value ?? 0}
                onChange={(_, value) => onChange(value as number)}
                min={min}
                max={max}
                step={step}
                valueLabelDisplay='auto'
                valueLabelFormat={renderValue}
                aria-label='Button Slider'
                sx={{ width: 200, mb: 0 }}
              />
            </ClickAwayListener>
          </Popper>
        </>
      )}
    </AnchorProvider>
  )
}
