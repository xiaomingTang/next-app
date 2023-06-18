import {
  ExpandLess,
  ExpandMore,
  PersonOffOutlined,
  PersonOutline,
} from '@mui/icons-material'
import {
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface MenuItemProps {
  name: string
  path?: string
  onClick?: () => void
  icon?: React.ReactElement
  children?: MenuItemProps[]
}

export const menuList: MenuItemProps[] = [
  {
    name: '用户管理',
    path: '/admin/user',
    icon: <PersonOutline />,
    children: [...new Array(5)].map((_, i) => ({
      name: `测试 nested ---- list-${i}`,
      path: '/admin/nested-user',
      icon: i % 2 ? <PersonOutline /> : <PersonOffOutlined />,
    })),
  },
  {
    name: '用户管理-2',
    path: '/admin/user',
    icon: <PersonOutline />,
    children: [
      ...[...new Array(5)].map((_, i) => ({
        name: `测试 nested ---- list-${i}`,
        path: '/admin/nested-user',
        icon: i % 2 ? <PersonOutline /> : <PersonOffOutlined />,
      })),
      {
        name: '用户管理-3',
        path: '/admin/user',
        icon: <PersonOutline />,
        children: [...new Array(5)].map((_, i) => ({
          name: `测试 nested ---- list-${i}`,
          path: '/admin/nested-user',
          icon: i % 2 ? <PersonOutline /> : <PersonOffOutlined />,
        })),
      },
    ],
  },
]

export const flattenMenuList = (function flatMenuList(
  list: MenuItemProps[],
  flatten: MenuItemProps[]
): MenuItemProps[] {
  list.forEach(({ children, ...item }) => {
    flatten.push(item)
    if (children && children.length > 0) {
      flatMenuList(children, flatten)
    }
  })
  return flatten
})(menuList, [])

export function NestedListItem(props: MenuItemProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const clickableItem = (
    <ListItemButton
      onClick={props.onClick}
      {...(!props.path
        ? {}
        : {
            selected: pathname === props.path,
            LinkComponent: Link,
            href: props.path,
          })}
    >
      {props.icon && (
        <ListItemIcon sx={{ minWidth: 'unset', marginRight: '0.5em' }}>
          {props.icon}
        </ListItemIcon>
      )}
      <ListItemText
        title={props.name}
        primary={<Typography noWrap>{props.name}</Typography>}
      />
    </ListItemButton>
  )

  if (!props.children || props.children.length === 0) {
    return (
      <ListItem key={props.name} disablePadding>
        {clickableItem}
      </ListItem>
    )
  }

  return (
    <>
      <ListItem key={props.name} disablePadding>
        {clickableItem}
        <IconButton onClick={() => setOpen((prev) => !prev)}>
          {open ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </ListItem>
      <Collapse in={open} timeout='auto'>
        <List disablePadding sx={{ paddingLeft: '0.5rem' }}>
          {props.children.map((subItem) => (
            <NestedListItem {...subItem} key={subItem.name} />
          ))}
          {/* mask */}
          <div className='absolute w-full h-full top-0 left-0 pointer-events-none bg-black bg-opacity-10' />
        </List>
      </Collapse>
    </>
  )
}
