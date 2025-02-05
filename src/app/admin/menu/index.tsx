import { useActiveMenu } from './constants'

import { Link } from '@/components/CustomLink'

import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Box,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import type { NestedMenu } from './MenuTree'

export function NestedListItem(props: NestedMenu) {
  const pathname = usePathname()
  const activeMenu = useActiveMenu()
  const [open, setOpen] = useState(
    () => !!activeMenu?.parents?.find((item) => item.path === props.path)
  )

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
        primary={props.name}
        sx={{
          whiteSpace: 'nowrap',
        }}
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
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </ListItem>
      <Collapse in={open} timeout='auto'>
        <List disablePadding sx={{ paddingLeft: '0.5rem' }}>
          {props.children.map((subItem) => (
            <NestedListItem {...subItem} key={subItem.name} />
          ))}
          {/* mask */}
          <Box className='absolute w-full h-full top-0 left-0 pointer-events-none bg-black/10' />
        </List>
      </Collapse>
    </>
  )
}
