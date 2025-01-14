import type { ContentType, ProjectType } from '@prisma/client'
import type { getRootProjectMenu } from '../server'
import type { SA_RES } from '@/errors/utils'

export type SimpleProjectItem = SA_RES<typeof getRootProjectMenu>[number]

export interface ProjectTree extends SimpleProjectItem {
  children?: ProjectTree[]
}

export class Tree {
  hash: string

  type: ProjectType

  createdAt: Date

  updatedAt: Date

  name: string

  parentHash: string

  contentType: ContentType | null

  children?: Tree[]

  parent?: Tree

  get isRoot() {
    return !this.parent
  }

  get root() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let root: Tree = this
    while (root.parent) {
      root = root.parent
    }
    return root
  }

  get relPath(): string {
    if (!this.parent) {
      return '/'
    }
    if (this.parent.isRoot) {
      return `/${this.name}`
    }
    return `${this.parent.relPath}/${this.name}`
  }

  static findById(tree: Tree, id: string): Tree | null {
    if (tree.hash === id) {
      return tree
    }
    if (tree.children) {
      for (let i = 0; i < tree.children.length; i += 1) {
        const found = Tree.findById(tree.children[i], id)
        if (found) {
          return found
        }
      }
    }
    return null
  }

  constructor(rawTree: ProjectTree) {
    this.hash = rawTree.hash
    this.type = rawTree.type
    this.createdAt = rawTree.createdAt
    this.updatedAt = rawTree.updatedAt
    this.name = rawTree.name
    this.parentHash = rawTree.parentHash
    this.contentType = rawTree.contentType
    this.children = rawTree.children?.map((child) => {
      const tree = new Tree(child)
      tree.parent = this
      return tree
    })
  }
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
