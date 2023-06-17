'use client'

import { NovelSearchButton } from './CornerButtons/NovelSearchButton'
import { UserButton } from './CornerButtons/UserButton'
import { ThemeToggleButton } from './CornerButtons/ThemeToggleButton'

import { Button } from '@mui/material'
import Link from 'next/link'

export function DefaultRawHeader() {
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
        <div className='flex-0 whitespace-nowrap'>
          <NovelSearchButton />
          <UserButton />
          <ThemeToggleButton />
        </div>
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
