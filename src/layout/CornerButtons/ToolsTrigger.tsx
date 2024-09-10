import { toolList } from './constants'

import { getEnabledHomepageLinks } from '@/app/admin/homepageLinks/server'
import { AnchorProvider } from '@/components/AnchorProvider'
import { triggerMenuItemEvents } from '@/utils/triggerMenuItemEvents'
import { SA } from '@/errors/utils'

import ListIcon from '@mui/icons-material/ArrowDropDown'
import { Button, Divider, Menu, MenuItem } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'
import useSWR from 'swr'

export function ToolsTrigger() {
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
            {dynamicHomepageLinks.length > 0 && <Divider />}
            {dynamicHomepageLinks.map(({ pathname, title }) => (
              <MenuItem
                key={title}
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
