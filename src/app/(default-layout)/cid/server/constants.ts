import type { Province } from 'province-city-china'

export type Gender = 'male' | 'female'

export function isProvinceDisabled(province: Province) {
  return province.code === '710000'
}

export type GenderText = '随机' | '男' | '女'

export interface FormProps {
  year: number
  month: number
  date: number
  gender: GenderText
  province?: string
  city?: string
  area?: string
}
