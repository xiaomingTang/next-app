import type { ProjectTree } from './arrayToTree'

const now = new Date()

export const loadingTreeData: [ProjectTree] = [
  {
    hash: 'LOADING',
    type: 'DIR',
    createdAt: now,
    updatedAt: now,
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
    createdAt: now,
    updatedAt: now,
    name: '加载出错',
    parentHash: 'ERROR',
    children: [],
    creatorId: 0,
  },
]

export function isValidTree(tree?: ProjectTree) {
  return !!tree && tree.hash !== 'LOADING' && tree.hash !== 'ERROR'
}
