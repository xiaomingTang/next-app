'use client'

import { useUser } from '@/hooks/useUser'

import Link from 'next/link'
import { Button, IconButton, NoSsr } from '@mui/material'
import { Person, PersonOutline, SearchOutlined } from '@mui/icons-material'
import router from 'next/router'
import { usePathname } from 'next/navigation'

export function DefaultRawHeader() {
  const user = { id: 0 }
  const pathname = usePathname()
  return (
    <header className='fixed w-full flex-none z-header h-10 md:h-14 backdrop-blur bg-gray-300 bg-opacity-60 dark:bg-gray-700 dark:bg-opacity-60'>
      <div className='max-w-screen-desktop m-auto flex justify-center items-center px-2 h-full'>
        <div className='flex-1 whitespace-nowrap overflow-x-auto h-full'>
          <Button
            variant='text'
            LinkComponent={Link}
            href='/'
            aria-label='首页'
            className='px-2'
            sx={{
              fontWeight: 'bold',
              fontSize: '1em',
              minWidth: 0,
              height: '100%',
            }}
          >
            首页
          </Button>
          <Button
            variant='text'
            LinkComponent={Link}
            href='/game'
            aria-label='小游戏'
            className='px-2'
            sx={{
              fontWeight: 'bold',
              fontSize: '1em',
              minWidth: 0,
              height: '100%',
            }}
          >
            小游戏
          </Button>
        </div>

        <NoSsr>
          <div className='flex-0 whitespace-nowrap'>
            {/* 直达搜索页 */}
            {!!user.id && (
              <>
                <IconButton
                  className='text-primary-main'
                  aria-label='搜索小说'
                  onClick={() => {
                    router.push(`/novel/s/d1`)
                  }}
                >
                  <SearchOutlined />
                </IconButton>
              </>
            )}
            {/* 登录按钮 */}
            {!user.id && pathname !== '/auth/login' && (
              <IconButton
                aria-label='登录'
                onClick={() => {
                  useUser.routeToLogin()
                }}
              >
                <PersonOutline />
              </IconButton>
            )}
            {/* 退出登录按钮 */}
            {!!user.id && (
              <IconButton
                aria-label='个人中心'
                onClick={() => {
                  router.push('/user/profile')
                }}
              >
                <Person color='primary' />
              </IconButton>
            )}
          </div>
        </NoSsr>
      </div>
    </header>
  )
}

export function DefaultHeader() {
  return (
    <>
      <DefaultRawHeader />
      <div className='py-2 md:py-4 flex-none pointer-events-none select-none'>
        &nbsp;
      </div>
    </>
  )
}
