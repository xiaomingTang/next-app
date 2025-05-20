'use server'

import firstNameList from '../data/first-name.json'
import boy1 from '../data/boy-1.json'
import boy2 from '../data/boy-2.json'
import girl1 from '../data/girl-1.json'
import girl2 from '../data/girl-2.json'

import { rand, weightedRandom } from '@/utils/array'
import { SA } from '@/errors/utils'

import { clamp } from 'lodash-es'

import type { Gender } from './constants'

interface GetRandomNameProps {
  firstName?: string
  /**
   * 目前只支持 1 或 2
   */
  lastNameLength?: number
  /**
   * 需要的名字的个数
   */
  count?: number
  gender?: Gender
}

const NAME_MAP = {
  male: [boy1, boy2],
  female: [girl1, girl2],
} as const

export const generateRandomName = SA.encode(
  async (props?: GetRandomNameProps) => {
    const result: string[] = []
    // 规范可能存在的用户输入
    const count = clamp(props?.count ?? 10, 1, 100)
    let lastNameLength = clamp(props?.lastNameLength ?? 1, 1, 2)
    let gender = props?.gender ?? 'male'
    if (!['male', 'female'].includes(gender)) {
      gender = 'male'
    }

    for (let i = 0; i < count; i += 1) {
      const firstName = props?.firstName || weightedRandom(firstNameList)
      // 如果用户未输入名字的位数，就使用随机值
      if (typeof props?.lastNameLength !== 'number') {
        lastNameLength = rand([1, 2])
      }
      // 如果用户未输入性别，就使用随机值
      if (!props?.gender) {
        gender = rand(['male', 'female'])
      }
      let fullName = ''
      switch (lastNameLength) {
        case 1: {
          const [nameList] = NAME_MAP[gender]
          fullName = `${firstName}${rand(nameList)}`
          break
        }
        default: {
          const [nameList1, nameList2] = NAME_MAP[gender]
          fullName = `${firstName}${rand(nameList1)}${rand(nameList2)}`
          break
        }
      }
      if (result.includes(fullName)) {
        i -= 1
      } else {
        result.push(fullName)
      }
    }

    return result
  }
)
