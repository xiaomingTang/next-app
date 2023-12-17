'use server'

import { SA } from '@/errors/utils'
import { rand } from '@/utils/array'

import rawLevelDate from 'province-city-china/dist/level.json'
import { clamp, random } from 'lodash-es'
import Boom from '@hapi/boom'

import type { Area, City, Province, Level } from 'province-city-china'
import type { Gender } from './constants'

// 屏蔽掉台湾
const levelDate = rawLevelDate.filter(
  (item) => item.code !== '710000'
) as Level[]

/**
 * 计算身份证号码的校验位
 */
function calcVerification(id: string) {
  // 身份证号码前17位数分别乘以不同的系数
  const ratio = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  // 将这17位数字和系数相乘的结果相加,对11进行求余，得出身份证最后一个字符
  const matchMap = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  let sum = 0
  ratio.forEach((r, i) => {
    sum += r * Number(id[i])
  })
  return matchMap[sum % 11]
}

function normalizeProvince(
  province: Province | undefined
): Province | undefined {
  if (!province) {
    return undefined
  }
  return {
    code: province.code,
    name: province.name,
    province: province.province,
  }
}

function normalizeCity(city: City | undefined): City | undefined {
  if (!city) {
    return undefined
  }
  return {
    code: city.code,
    name: city.name,
    city: city.city,
    province: city.province,
  }
}

function normalizeArea(area: City | Area | undefined): Area | undefined {
  if (!area) {
    return undefined
  }
  return {
    code: area.code,
    name: area.name,
    city: area.city,
    province: area.province,
    // 处理 儋州市 等
    area: (area as Area).area ?? '00',
  }
}

interface CityInLevel extends City {
  children?: Area[] | undefined
}

function getData(provinceCode?: string, cityCode?: string, areaCode?: string) {
  const province = !provinceCode
    ? rand(levelDate)
    : levelDate.find((item) => item.province === provinceCode)
  if (!province) {
    return undefined
  }
  const cityList = province?.children ?? []
  let city: CityInLevel | undefined
  if (cityList.every((item) => !item.children || item.children.length === 0)) {
    if (!areaCode) {
      city = !cityCode
        ? rand(cityList)
        : rand(cityList.filter((item) => item.city === cityCode))
      if (!city) {
        return undefined
      }
      return {
        province: normalizeProvince(province),
        city: normalizeCity(city),
        area: normalizeArea(city as CityInLevel & Area),
      }
    }
    city = (cityList as (CityInLevel & Area)[]).find(
      (item) => item.city === cityCode && item.area === areaCode
    )
    if (!city) {
      return undefined
    }
    return {
      province: normalizeProvince(province),
      city: normalizeCity(city),
      area: normalizeArea(city as CityInLevel & Area),
    }
  }
  city = !cityCode
    ? rand(cityList)
    : cityList.find((item) => item.city === cityCode)
  const areaList = city?.children ?? []
  const area = !areaCode
    ? rand(areaList)
    : areaList.find((item) => item.area === areaCode)
  return {
    province: normalizeProvince(province),
    city: normalizeCity(city),
    area: normalizeArea(area ?? city),
  }
}

export const decodeId = SA.encode(async (id: string) => {
  const match = /^(\d\d)(\d\d)(\d\d)(\d{4})(\d\d)(\d\d)(\d\d)(\d)(\d|X)$/i.exec(
    id
  )
  if (!match) {
    throw Boom.badRequest('身份证号格式有误')
  }
  if (calcVerification(id).toUpperCase() !== match[9].toUpperCase()) {
    throw Boom.badRequest('身份证号校验不通过')
  }
  const birthday = new Date(`${match[4]}-${match[5]}-${match[6]}`)
  if (
    birthday.getFullYear() !== +match[4] ||
    birthday.getMonth() !== +match[5] - 1 ||
    birthday.getDate() !== +match[6]
  ) {
    throw Boom.badRequest('出生日期是瞎写的吗？')
  }
  if (birthday.getTime() > Date.now()) {
    throw Boom.badRequest('出生日期是未来啊？')
  }
  const gender = +match[8] % 2 ? 'male' : ('female' as const)
  const data = getData(match[1], match[2], match[3])
  if (!data) {
    throw Boom.badRequest('不存在该省市区')
  }
  if (!data.province) {
    console.log(data)
    throw Boom.badRequest('不存在该省')
  }
  if (!data.city) {
    console.log(data)
    throw Boom.badRequest('不存在该市')
  }
  if (!data.area) {
    console.log(data)
    throw Boom.badRequest('不存在该区县')
  }
  return {
    province: data.province,
    city: data.city,
    area: data.area,
    birthday,
    gender,
  }
})

export interface RandomUserConfig {
  count?: number
  /**
   * 省 code
   */
  province?: string
  /**
   * 市 code
   */
  city?: string
  /**
   * 区县 code
   */
  area?: string
  gender?: Gender
  year?: number
  /**
   * 0 - 11
   */
  month?: number
  /**
   * 1 - 31
   */
  date?: number
  /**
   * 固话区号
   */
  districtCode?: string
}

export interface RandomUserRet {
  province: Province
  city: City
  area: Area
  gender: Gender
  id: string
  birthday: Date
}

function generateId(user: Omit<RandomUserRet, 'id'>) {
  const id = [
    user.province.province,
    user.city.city,
    user.area.area.toString(),
    user.birthday.getFullYear().toString(),
    (user.birthday.getMonth() + 1).toString().padStart(2, '0'),
    user.birthday.getDate().toString().padStart(2, '0'),
    random(0, 99, false).toString().padStart(2, '0'),
    user.gender === 'male' ? rand('13579') : rand('02468'),
  ].join('')
  return `${id}${calcVerification(id)}`
}

export const generateRandomUser = SA.encode(
  async (config: RandomUserConfig) => {
    const result: RandomUserRet[] = []
    const count = clamp(config?.count ?? 1, 1, 10)
    for (let i = 0; i < count; i += 1) {
      const { province, city, area } =
        getData(config.province, config.city, config.area) ?? {}
      if (!province) {
        throw Boom.badRequest('省信息有误')
      }
      if (!city) {
        console.log({ province })
        throw Boom.badRequest('市信息有误')
      }
      if (!area) {
        console.log({ province, city })
        throw Boom.badRequest('区县信息有误')
      }
      const now = new Date()
      let age: number
      const ageRand = Math.random()
      if (ageRand < 0.6) {
        age = random(20, 30, false)
      } else if (ageRand < 0.9) {
        age = random(30, 40, false)
      } else {
        age = random(40, 70, false)
      }
      const year = config.year ?? now.getFullYear() - age
      const month = config.month ?? random(0, 11, false)
      const date = config.date ?? random(0, 31, false)
      const birthday = new Date(year, month, date)
      const gender = config.gender ?? rand(['male', 'female'])
      const user: RandomUserRet = {
        province,
        city,
        area,
        gender,
        id: '',
        birthday,
      }
      user.id = generateId(user)
      if (result.find((item) => item.id === user.id)) {
        i -= 1
      } else {
        result.push(user)
      }
    }
    return result
  }
)
