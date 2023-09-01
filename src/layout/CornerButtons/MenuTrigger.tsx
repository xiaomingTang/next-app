import { cardList } from './CardsTrigger'

import { AnchorProvider } from '@/components/AnchorProvider'
import { triggerMenuItemEvents } from '@/utils/triggerMenuItemEvents'

import MenuIcon from '@mui/icons-material/Menu'
import { IconButton, Menu, MenuItem } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'

const menuList = [
  {
    pathname: '/about',
    title: '关于',
  },
  ...cardList,
]

export function MenuTrigger() {
  const router = useRouter()
  const curPathname = usePathname()

  return (
    <AnchorProvider>
      {(anchorEl, setAnchorEl) => (
        <>
          <IconButton
            aria-label='更多菜单'
            aria-controls={anchorEl ? 'header-more-menu' : undefined}
            onClick={(e) => {
              setAnchorEl(e.currentTarget)
            }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id='header-more-menu'
            anchorEl={anchorEl}
            open={!!anchorEl}
            autoFocus
            onClose={() => setAnchorEl(null)}
            MenuListProps={{
              'aria-labelledby': '关闭更多菜单',
            }}
          >
            {menuList.map(({ pathname, title }) => (
              <MenuItem
                key={pathname}
                dense
                selected={pathname === curPathname}
                {...triggerMenuItemEvents((e, reason) => {
                  setAnchorEl(null)
                  if (reason === 'middleClick') {
                    window.open(pathname, '_blank')
                  } else {
                    router.push(pathname)
                  }
                })}
              >
                {title}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </AnchorProvider>
  )
}
