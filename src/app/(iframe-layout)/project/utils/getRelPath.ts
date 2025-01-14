import type { ProjectTree } from './arrayToTree'

export function getRelPath(item: ProjectTree, root: ProjectTree) {
  if (item.hash === root.hash) {
    return '/'
  }
  if (item.parentHash === root.hash) {
    return `/${item.name}`
  }
  const findPaths = (hash: string, tree: ProjectTree): string[] => {
    if (tree.hash === hash) {
      return [tree.name]
    }
    if (tree.children) {
      for (let i = 0; i < tree.children.length; i += 1) {
        const paths = findPaths(hash, tree.children[i])
        if (paths.length > 0) {
          return [tree.name, ...paths]
        }
      }
    }
    throw new Error('paths not found')
  }
  const paths = findPaths(item.parentHash, root)
  // 移除 root
  paths.shift()
  return `/${paths.join('/')}/${item.name}`
}
