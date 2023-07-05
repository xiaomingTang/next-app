'use client'

import usePWAStatus from './usePWAStatus'

import { useEffect, useState } from 'react'
import { Box, CircularProgress, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export default function PWAStaleTip() {
  const { hasNewVersion, isNewVersionInstalled } = usePWAStatus()
  const [localClosed, setLocalClosed] = useState(false)

  useEffect(() => {
    let timer = -1
    if (hasNewVersion && isNewVersionInstalled) {
      timer = window.setTimeout(() => {
        setLocalClosed(true)
      }, 3000)
    }
    return () => {
      window.clearTimeout(timer)
    }
  }, [hasNewVersion, isNewVersionInstalled])

  if (!hasNewVersion) {
    return <></>
  }

  if (isNewVersionInstalled && localClosed) {
    return <></>
  }

  if (localClosed) {
    return (
      <IconButton
        aria-label='show the pwa tips'
        className='fixed z-pwaTip bottom-4 right-4 backdrop-blur bg-primary-200 text-primary-main shadow shadow-b-200'
        onClick={() => {
          setLocalClosed(false)
        }}
      >
        <CircularProgress
          aria-label='pwa loading'
          size={16}
          className='align-middle'
        />
      </IconButton>
    )
  }

  return (
    <Box className='fixed z-pwaTip bottom-4 right-4 p-2 rounded backdrop-blur bg-primary-200 text-primary-main shadow-lg shadow-b-200'>
      {isNewVersionInstalled ? (
        <Box className='text-center'>
          已为您加载
          <br />
          <b>最新版本</b>
        </Box>
      ) : (
        <>
          发现新版本
          <br />
          正在为您加载中{' '}
          <CircularProgress
            aria-label='pwa loading'
            size={16}
            className='align-middle'
          />
        </>
      )}
      <IconButton
        aria-label='close the pwa tips'
        className='absolute w-6 h-6 -right-3 -top-3 bg-primary-300 hover:bg-primary-400 text-white'
        onClick={() => {
          setLocalClosed(true)
        }}
      >
        <CloseIcon className='text-base' />
      </IconButton>
    </Box>
  )
}
