'use client'

import { NestedListItem, flattenMenuList, menuList } from './menu'

import { MenuOutlined } from '@mui/icons-material'
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  Slide,
  Toolbar,
  Typography,
  useScrollTrigger,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'

const drawerWidth = 240

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const trigger = useScrollTrigger()
  const title = useMemo(() => {
    const menuItem = flattenMenuList.find((item) => item.path === pathname)
    if (menuItem) {
      return menuItem.name
    }
    return '小明的后台管理'
  }, [pathname])

  useEffect(() => {
    document.title = title
  }, [title])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {menuList.map((item) => (
          <NestedListItem {...item} key={item.name} />
        ))}
      </List>
    </div>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <Slide appear={false} direction='down' in={!trigger}>
        <AppBar
          position='fixed'
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color='inherit'
              aria-label='打开路由菜单'
              edge='start'
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuOutlined />
            </IconButton>
            <Typography variant='h6' noWrap component='div'>
              {title}
            </Typography>
          </Toolbar>
        </AppBar>
      </Slide>
      <Box
        component='nav'
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label='菜单'
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          variant='temporary'
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            // Better open performance on mobile.
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant='permanent'
          open
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}
