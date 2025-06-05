import { numberFormat } from '@/utils/numberFormat'

function formatValue(value?: string | undefined) {
  return value ? value.trim().toLowerCase() : ''
}

export function b(value?: string | undefined): boolean {
  const formated = formatValue(value)
  return formated === 'true' || formated === '1' || formated === 'yes'
}

export const n = numberFormat
