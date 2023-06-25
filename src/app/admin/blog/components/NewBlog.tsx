'use client'

import { createNewBlog, getBlog } from './server'

import { SA } from '@/errors/utils'

import { forwardRef, useState } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import Slide from '@mui/material/Slide'
import useSWR from 'swr'
import { TextField, TextareaAutosize } from '@mui/material'

import type { TransitionProps } from '@mui/material/transitions'

function RawTransition(
  props: TransitionProps & {
    children: React.ReactElement
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
}

const Transition = forwardRef(RawTransition)

export function useEditBlog() {
  const [open, setOpen] = useState(false)
  const [editingBlogHash, setEditingBlogHash] = useState('')

  const { data: blog, isValidating: isBlogLoading } = useSWR(
    ['getBlog', editingBlogHash, open],
    () => {
      if (!open) {
        return null
      }
      return createNewBlog().then(SA.decode)
    }
  )

  const handleClose = () => {
    setOpen(false)
  }

  const elem = (
    <>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge='start'
              color='inherit'
              onClick={handleClose}
              aria-label='close'
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
              新建博客
            </Typography>
            <Button autoFocus color='inherit' onClick={handleClose}>
              保存
            </Button>
          </Toolbar>
        </AppBar>
        <TextField label='标题' />
        <TextareaAutosize placeholder='内容' />
      </Dialog>
    </>
  )

  const edit = (blogHash = '') => {
    setEditingBlogHash(blogHash)
    setOpen(true)
  }

  return {
    elem,
    edit,
  }
}
