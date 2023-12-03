import { AnchorProvider } from '@/components/AnchorProvider'
import { triggerMenuItemEvents } from '@/utils/triggerMenuItemEvents'

import ListIcon from '@mui/icons-material/ArrowDropDown'
import { Button, Menu, MenuItem } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'

export const toolList = [
  { pathname: '/wallpaper', title: '壁纸' },
  { pathname: '/gotcha', title: '试一试' },
  { pathname: '/color', title: '色一色' },
]

export function ToolsTrigger() {
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
            玩具 <ListIcon />
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={!!anchorEl}
            autoFocus
            onClose={() => setAnchorEl(null)}
            MenuListProps={{
              'aria-labelledby': '关闭列表',
            }}
          >
            {toolList.map(({ pathname, title }) => (
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
