import type { ProjectTree } from './arrayToTree'

// 随便初始化一个时间
const initDate = new Date('2025-01-01T00:00:00Z')

export const loadingTreeData: [ProjectTree] = [
  {
    hash: 'LOADING',
    type: 'DIR',
    createdAt: initDate,
    updatedAt: initDate,
    name: '加载中...',
    parentHash: 'LOADING',
    children: [],
    creatorId: 0,
  },
]

export const errorTreeData: [ProjectTree] = [
  {
    hash: 'ERROR',
    type: 'DIR',
    createdAt: initDate,
    updatedAt: initDate,
    name: '加载出错',
    parentHash: 'ERROR',
    children: [],
    creatorId: 0,
  },
]

export function isValidTree(tree?: ProjectTree) {
  return !!tree && tree.hash !== 'LOADING' && tree.hash !== 'ERROR'
}
