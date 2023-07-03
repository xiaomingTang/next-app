'use client'

import { useUser } from '@/user'
import { useLoading } from '@/hooks/useLoading'
import { SvgLoading } from '@/svg'
import { cat } from '@/errors/catchAndToast'
import { RoleNameMap } from '@/constants'

import { IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material'
import {
  Logout,
  Person,
  PersonOutline,
  VerifiedUser,
} from '@mui/icons-material'
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
        color='inherit'
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
        {/* MUI 有 bug, 这儿不能用 AuthRequired 组件, 否则会导致键盘导航出问题 */}
        {user.role === Role.ADMIN && (
          <MenuItem
            divider
            onClick={() => {
              handleClose()
              router.push('/admin')
            }}
          >
            <ListItemIcon>
              <VerifiedUser fontSize='small' />
            </ListItemIcon>
            管理员界面
          </MenuItem>
        )}
        <MenuItem
          onClick={withLoading(
            cat(async () => {
              handleClose()
              await useUser.logout()
            })
          )}
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
      onClick={cat(async () => {
        await useUser.login()
      })}
    >
      <PersonOutline />
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
