import { menuList } from './constants'

import { getEnabledHomepageLinks } from '@/app/admin/homepageLinks/server'
import { AnchorProvider } from '@/components/AnchorProvider'
import { triggerMenuItemEvents } from '@/utils/triggerMenuItemEvents'
import { SA } from '@/errors/utils'

import MenuIcon from '@mui/icons-material/Menu'
import { Divider, IconButton, Menu, MenuItem } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'
import useSWR from 'swr'

export function MenuTrigger() {
  const router = useRouter()
  const curPathname = usePathname()
  const { data: dynamicHomepageLinks = [] } = useSWR(
    'getEnabledHomepageLinks',
    () =>
      getEnabledHomepageLinks()
        .then(SA.decode)
        .then((res) =>
          res.map((item) => ({
            pathname: item.url,
            title: item.name,
          }))
        )
  )

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
            slotProps={{
              list: {
                'aria-labelledby': '关闭更多菜单',
              },
            }}
          >
            {menuList.map((item, i) => {
              if (item === 'divider') {
                return <Divider key={i} />
              }
              const { pathname, title } = item
              return (
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
              )
            })}
            {dynamicHomepageLinks.length > 0 && <Divider />}
            {dynamicHomepageLinks.map(({ pathname, title }) => (
              <MenuItem
                key={title}
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
