import type { Role } from '@/generated-prisma-client'

export interface MenuItemProps {
  name: string
  path?: string
  roles?: Role[]
  onClick?: () => void
  icon?: React.ReactElement
}

export interface NestedMenu extends MenuItemProps {
  children?: NestedMenu[]
}

export class MenuTree implements MenuItemProps {
  name: string

  path?: string

  roles?: Role[]

  onClick?: () => void

  icon?: React.ReactElement

  children: MenuTree[] = []

  parent?: MenuTree

  constructor(props?: NestedMenu) {
    this.name = props?.name ?? 'unknown'
    this.path = props?.path
    this.roles = props?.roles
    this.onClick = props?.onClick
    this.icon = props?.icon
    this.children =
      props?.children?.map((item) => {
        const tree = new MenuTree(item)
        tree.parent = this
        return tree
      }) ?? []
  }

  public get root(): MenuTree {
    if (this.parent) {
      return this.parent.root
    }
    return this
  }

  public get parents(): MenuTree[] {
    if (!this.parent) {
      return []
    }
    return [this.parent, ...this.parent.parents]
  }

  public findChild(
    callback: (item: MenuTree) => MenuTree | undefined
  ): MenuTree | undefined {
    for (let i = 0; i < this.children.length; i += 1) {
      const res =
        callback(this.children[i]) ?? this.children[i].findChild(callback)
      if (res) {
        return res
      }
    }
    return undefined
  }
}
