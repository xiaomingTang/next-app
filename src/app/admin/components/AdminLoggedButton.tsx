import { RoleNameMap } from '@/constants'
import { useLoading } from '@/hooks/useLoading'
import SvgLoading from '@/svg/assets/loading.svg?icon'
import { useUser } from '@/user'
import { triggerMenuItemEvents } from '@/utils/triggerMenuItemEvents'

import PersonIcon from '@mui/icons-material/Person'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import LogoutIcon from '@mui/icons-material/Logout'
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'
import { IconButton, Menu, MenuItem, ListItemIcon } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function AdminLoggedButton() {
  const user = useUser()
  const router = useRouter()
  const [loading, withLoading] = useLoading()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  if (!user.id) {
    return <></>
  }

  return (
    <>
      <IconButton
        aria-label='退出登录'
        aria-controls={open ? 'logout-menu' : undefined}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? <SvgLoading className='animate-spin' /> : <PersonIcon />}
      </IconButton>
      <Menu
        id='logout-menu'
        anchorEl={anchorEl}
        open={open}
        autoFocus
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': '退出登录',
          },
        }}
      >
        <MenuItem disabled divider>
          {user.role === 'ADMIN' && `[${RoleNameMap[user.role]}]`}
          {user.name}
        </MenuItem>
        <MenuItem
          {...triggerMenuItemEvents((e, reason) => {
            handleClose()
            if (reason === 'middleClick') {
              window.open('/', '_blank')
            } else {
              router.push('/')
            }
          })}
        >
          <ListItemIcon>
            <VerifiedUserIcon fontSize='small' />
          </ListItemIcon>
          前台首页
        </MenuItem>
        <MenuItem
          divider
          {...triggerMenuItemEvents((e, reason) => {
            handleClose()
            if (reason === 'middleClick') {
              window.open('/project/new', '_blank')
            } else {
              router.push('/project/new')
            }
          })}
        >
          <ListItemIcon>
            <CreateNewFolderIcon fontSize='small' />
          </ListItemIcon>
          Project - New
        </MenuItem>
        <MenuItem
          onClick={withLoading(async () => {
            handleClose()
            await useUser.logout().catch((err) => toast.error(err.message))
          })}
        >
          <ListItemIcon>
            <LogoutIcon fontSize='small' />
          </ListItemIcon>
          退出登录
        </MenuItem>
      </Menu>
    </>
  )
}
