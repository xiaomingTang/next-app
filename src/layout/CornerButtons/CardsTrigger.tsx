import { AnchorProvider } from '@/components/AnchorProvider'
import { triggerMenuItemEvents } from '@/utils/triggerMenuItemEvents'

import ListIcon from '@mui/icons-material/ArrowDropDown'
import { Button, Menu, MenuItem } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'

const menuList = [
  { pathname: '/cards/fruits', title: '水果' },
  { pathname: '/cards/foods', title: '肉和菜' },
  { pathname: '/cards/colors', title: '颜色' },
  { pathname: '/cards/area', title: '国家和地区' },
]

export function CardsTrigger() {
  const router = useRouter()
  const curPathname = usePathname()
  return (
    <AnchorProvider>
      {(anchorEl, setAnchorEl) => (
        <>
          <Button
            variant='text'
            color='inherit'
            sx={{
              fontWeight: 'bold',
              fontSize: '1em',
              minWidth: 0,
              height: '100%',
              px: 1,
              whiteSpace: 'nowrap',
            }}
            onClick={(e) => {
              setAnchorEl(e.currentTarget)
            }}
          >
            卡片 <ListIcon />
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={!!anchorEl}
            autoFocus
            onClose={() => setAnchorEl(null)}
            MenuListProps={{
              'aria-labelledby': '关闭卡片列表',
            }}
          >
            {menuList.map(({ pathname, title }) => (
              <MenuItem
                key={pathname}
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
