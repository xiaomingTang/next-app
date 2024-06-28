import json from './gk.json'

type DataItem = (typeof json)[0]
type DataKey = keyof DataItem

function getDiffValues<T extends DataKey>(key: T) {
  const set = new Set<DataItem[T]>()
  json.forEach((item) => {
    set.add(item[key])
  })
  return Array.from(set)
}

export const all批次 = getDiffValues('批次名称')

export const all高校 = getDiffValues('高校名称')

export const allYears = getDiffValues('年份').sort()

export const allMajors = getDiffValues('专业名称')

export const all计划性质 = getDiffValues('计划性质名称')

const mapColor批次 = {
  '提前批本科(一本线)': '#e0564a',
  '提前批本科(二本线)': '#dd77ef',
  地方专项: '#2c4af4',
  国家专项一本: '#6c83d8',
  第一批本科: '#759105',
  第二批本科: '#157a9b',
}

export function getColor批次(s: string) {
  return mapColor批次[s as keyof typeof mapColor批次] ?? '#000000'
}
