import { RoleNameMap } from '@/constants'
import { useLoading } from '@/hooks/useLoading'
import { SvgLoading } from '@/svg'
import { useUser } from '@/user'

import PersonIcon from '@mui/icons-material/Person'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import LogoutIcon from '@mui/icons-material/Logout'
import { IconButton, Menu, MenuItem, ListItemIcon } from '@mui/material'
import { Role } from '@prisma/client'
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
        MenuListProps={{
          'aria-labelledby': '退出登录',
        }}
      >
        <MenuItem disabled divider>
          {user.role === Role.ADMIN && `[${RoleNameMap[user.role]}]`}
          {user.name}
        </MenuItem>
        <MenuItem
          divider
          onClick={() => {
            handleClose()
            router.push('/')
          }}
        >
          <ListItemIcon>
            <VerifiedUserIcon fontSize='small' />
          </ListItemIcon>
          前台首页
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
