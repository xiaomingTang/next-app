'use client'

import { AdminLoggedButton } from './AdminLoggedButton'

import { menuTree, useActiveMenu } from '../menu/constants'
import { NestedListItem } from '../menu'

import { ThemeToggleButton } from '@/layout/CornerButtons/ThemeToggleButton'
import { AuthRequired } from '@/components/AuthRequired'
import { seo } from '@/utils/seo'

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
import { useEffect, useState } from 'react'

const drawerWidth = 240

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const trigger = useScrollTrigger()
  const activeMenu = useActiveMenu()
  const title = activeMenu?.name ?? '小明的后台管理'
  document.title = seo.title(title)

  useEffect(() => {
    // 路由变化时关闭 Drawer
    setMobileOpen(false)
  }, [activeMenu])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <Box>
      <Toolbar />
      <Divider />
      <List>
        {menuTree.children.map((item) => (
          <AuthRequired key={item.name} roles={item.roles}>
            <NestedListItem {...item} />
          </AuthRequired>
        ))}
      </List>
    </Box>
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
              aria-label='打开路由菜单'
              edge='start'
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuOutlined />
            </IconButton>
            <Typography
              variant='h6'
              noWrap
              component='div'
              sx={{ flexGrow: 1 }}
            >
              {title}
            </Typography>
            <AdminLoggedButton />
            <ThemeToggleButton />
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
          minWidth: '800px',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}
