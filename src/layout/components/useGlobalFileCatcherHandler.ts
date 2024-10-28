import { upload } from '@D/upload/components/Uploader'
import { useUser } from '@/user'
import { withStatic } from '@/utils/withStatic'

import { create } from 'zustand'
import { useEventCallback } from '@mui/material'
import { useEffect } from 'react'

type FileCatcherHandler = (files: File[]) => Promise<void> | void

const defaultFileCatcherHandler: FileCatcherHandler = async (files: File[]) => {
  await useUser.login()
  await upload(files)
}

const noneFileCatcherHandler: FileCatcherHandler = (_: File[]) => {
  // pass
}

const useRawGlobalFileCatcherHandler = create(() => ({
  handler: defaultFileCatcherHandler,
}))

/**
 * - 用于更新全局文件粘贴/拖拽处理程序
 * - 杜绝滥用
 * - 如果后续需要在多处使用, 务必修改机制:
 *    - 令 FileUploadCatcher 在需要的地方调用 (而非目前的放在 DefaultLayout 里面)
 */
export const useGlobalFileCatcherHandler = withStatic(
  useRawGlobalFileCatcherHandler,
  {
    updateHandler(newHandler: FileCatcherHandler) {
      useRawGlobalFileCatcherHandler.setState({
        handler: newHandler,
      })
    },
    resetHandler() {
      useRawGlobalFileCatcherHandler.setState({
        handler: defaultFileCatcherHandler,
      })
    },
    removeHandler() {
      useRawGlobalFileCatcherHandler.setState({
        handler: noneFileCatcherHandler,
      })
    },
    useUpdateHandler(newHandler: FileCatcherHandler) {
      const finalNewHandler = useEventCallback(newHandler)
      useEffect(() => {
        const prevHandler = useRawGlobalFileCatcherHandler.getState().handler
        useRawGlobalFileCatcherHandler.setState({
          handler: finalNewHandler,
        })

        return () => {
          useRawGlobalFileCatcherHandler.setState({
            handler: prevHandler,
          })
        }
      }, [finalNewHandler])
    },
  }
)
