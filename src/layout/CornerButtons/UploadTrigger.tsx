'use client'

import { cat } from '@/errors/catchAndToast'
import { upload } from '@/app/upload/components/Uploader'
import { useUser } from '@/user'

import { IconButton } from '@mui/material'
import UploadIcon from '@mui/icons-material/Upload'

export function UploadTrigger() {
  const user = useUser()
  if (!user.id) {
    return <></>
  }
  return (
    <IconButton
      aria-label='上传'
      onClick={cat(async () => {
        await upload()
      })}
    >
      <UploadIcon />
    </IconButton>
  )
}
