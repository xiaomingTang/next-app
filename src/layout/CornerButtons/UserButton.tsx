'use client'

import { useUser } from '@/user'
import { useLoading } from '@/hooks/useLoading'
import { SvgLoading } from '@/svg'
import { cat } from '@/errors/catchAndToast'
import { RoleNameMap } from '@/constants'

import { IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import { useState } from 'react'
import { Role } from '@prisma/client'
import { useRouter } from 'next/navigation'

function LoggedButton() {
  const user = useUser()
  const router = useRouter()
  const { loading, withLoading } = useLoading()
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
        {loading ? (
          <SvgLoading className='animate-spin' />
        ) : (
          <PersonIcon color='primary' />
        )}
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
          {user.role === Role.ADMIN && ` [${RoleNameMap[user.role]}]`}
          {user.name}
        </MenuItem>
        <MenuItem
          divider
          onClick={() => {
            handleClose()
            router.push('/admin')
          }}
        >
          <ListItemIcon>
            <VerifiedUserIcon fontSize='small' />
          </ListItemIcon>
          管理后台
        </MenuItem>
        <MenuItem
          onClick={withLoading(
            cat(async () => {
              handleClose()
              await useUser.logout()
            })
          )}
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

function LoginButton() {
  const user = useUser()
  if (user.id) {
    return <></>
  }

  return (
    <IconButton
      aria-label='登录'
      onClick={cat(async () => {
        await useUser.login()
      })}
    >
      <PersonOutlineIcon />
    </IconButton>
  )
}

export function UserButton() {
  return (
    <>
      <LoginButton />
      <LoggedButton />
    </>
  )
}
