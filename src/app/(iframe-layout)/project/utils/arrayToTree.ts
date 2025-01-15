import type { getRootProjectMenu } from '../server'
import type { SA_RES } from '@/errors/utils'

export type SimpleProjectItem = SA_RES<typeof getRootProjectMenu>[number]

export interface ProjectTree extends SimpleProjectItem {
  children?: ProjectTree[]
}

export function arrayToTree(items: ProjectTree[]) {
  const map: Record<string, ProjectTree> = {}
  const root = items.find((item) => item.hash === item.parentHash)

  if (!root) {
    throw new Error('根节点不存在')
  }

  items.forEach((item) => {
    map[item.hash] = { ...item, children: item.type === 'DIR' ? [] : undefined }
  })

  items.forEach((item) => {
    if (item.parentHash === item.hash) {
      return
    }
    map[item.parentHash].children?.push(map[item.hash])
  })

  return map[root.hash]
}

export function treeMap(
  tree: ProjectTree,
  fn: (tree: ProjectTree) => ProjectTree
): ProjectTree {
  const newTree = fn(tree)
  if (tree.children) {
    newTree.children = tree.children.map((child) => treeMap(child, fn))
  }
  return newTree
}

export function findItemByPath(
  tree: ProjectTree | undefined | null = null,
  path: string
) {
  const paths = path.split('/').filter(Boolean)
  let cur = tree
  for (let i = 0; i < paths.length; i++) {
    const p = paths[i]
    const next = cur?.children?.find((child) => child.name === p)
    if (!next) {
      return null
    }
    cur = next
  }
  return cur
}
