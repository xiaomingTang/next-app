'use client'

import { useUser } from '@/user'
import { useLoading } from '@/hooks/useLoading'
import { SvgLoading } from '@/svg'

import { IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material'
import { Logout, Person, PersonOutline } from '@mui/icons-material'
import { toast } from 'react-hot-toast'
import { useState } from 'react'

function LogoutButton() {
  const user = useUser()
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
          <Person color='primary' />
        )}
      </IconButton>
      <Menu
        id='logout-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': '退出登录',
        }}
      >
        <MenuItem disabled divider>
          {user.name}
        </MenuItem>
        <MenuItem
          onClick={withLoading(async () => {
            handleClose()
            await useUser.logout().catch((err) => toast.error(err.message))
          })}
        >
          <ListItemIcon>
            <Logout fontSize='small' />
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
      onClick={() => {
        useUser.login().catch((err) => toast.error(err.message))
      }}
    >
      <PersonOutline />
    </IconButton>
  )
}

export function UserButton() {
  return (
    <>
      <LoginButton />
      <LogoutButton />
    </>
  )
}
