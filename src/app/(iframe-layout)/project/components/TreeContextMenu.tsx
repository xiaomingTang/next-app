import { renameProject } from './RenameModal'

import { getRelPath } from '../utils/getRelPath'
import { createProject, deleteProject } from '../server'

import { cat } from '@/errors/catchAndToast'
import { customConfirm } from '@/utils/customConfirm'
import { SA } from '@/errors/utils'
import { resolvePath } from '@/utils/url'

import { Divider, Menu, MenuItem, useTheme } from '@mui/material'
import { useRouter } from 'next/navigation'
import CopyToClipboard from 'react-copy-to-clipboard'
import toast from 'react-hot-toast'

import type {
  TreeViewPublicAPI,
  UseTreeViewExpansionSignature,
  UseTreeViewFocusSignature,
  UseTreeViewIconsSignature,
  UseTreeViewItemsSignature,
  UseTreeViewKeyboardNavigationSignature,
  UseTreeViewLabelSignature,
  UseTreeViewSelectionSignature,
} from '@mui/x-tree-view/internals'
import type { MutableRefObject } from 'react'
import type { ProjectTree } from '../utils/arrayToTree'

type ApiRef = MutableRefObject<
  | TreeViewPublicAPI<
      readonly [
        UseTreeViewItemsSignature,
        UseTreeViewExpansionSignature,
        UseTreeViewSelectionSignature,
        UseTreeViewFocusSignature,
        UseTreeViewKeyboardNavigationSignature,
        UseTreeViewIconsSignature,
        UseTreeViewLabelSignature,
      ]
    >
  | undefined
>

export function TreeContextMenu({
  target,
  setTarget,
  item,
  root,
  onRename,
}: {
  target: HTMLElement | null
  setTarget: React.Dispatch<React.SetStateAction<HTMLElement | null>>
  item: ProjectTree | null
  root: ProjectTree
  apiRef: ApiRef
  onRename: (id: string, newLabel: string) => void | Promise<void>
}) {
  const router = useRouter()
  const theme = useTheme()
  if (!target || !item) {
    return <></>
  }
  const withClose = (fn?: unknown) => async () => {
    if (fn instanceof Function) {
      try {
        await fn()
      } finally {
        setTarget(null)
      }
      return
    }
    setTarget(null)
  }
  const relPath = getRelPath(item, root)
  const absPath = resolvePath(`/project/${root.hash}${relPath}`).href
  const childrenLen = item.children?.length ?? 0
  const isRoot = item.hash === root.hash
  const deleteItem = withClose(
    cat(async () => {
      if (isRoot) {
        if (await customConfirm('是否删除整个项目', 'SLIGHT')) {
          await deleteProject({ hash: item.hash }).then(SA.decode)
          router.refresh()
        }
        return
      }
      if (item.type === 'DIR') {
        console.log(item.hash)
        if (childrenLen === 0) {
          await deleteProject({ hash: item.hash }).then(SA.decode)
          router.refresh()
          return
        }
        if (await customConfirm(`是否删除整个目录【${item.name}】`, 'SLIGHT')) {
          await deleteProject({ hash: item.hash }).then(SA.decode)
          router.refresh()
        }
        return
      }
      if (await customConfirm(`是否删除文件【${item.name}】`, 'SLIGHT')) {
        await deleteProject({ hash: item.hash }).then(SA.decode)
        router.refresh()
      }
    })
  )
  // TODO: 弹窗重命名 & 新建文件（夹）
  const rename = withClose(async () => {
    const res = await renameProject(item)
    await onRename(res.hash, res.name)
  })
  const createDir = withClose(
    cat(async () => {
      await createProject({
        name: '未命名',
        parentHash: item.hash,
        type: 'DIR',
      }).then(SA.decode)
      router.refresh()
    })
  )
  if (item.type === 'DIR') {
    return (
      <Menu open anchorEl={target} onClose={withClose()}>
        <MenuItem>新建文件</MenuItem>
        <MenuItem onClick={createDir}>新建文件夹</MenuItem>
        <Divider />
        <MenuItem onClick={rename}>重命名</MenuItem>
        <MenuItem sx={{ color: theme.palette.error.main }} onClick={deleteItem}>
          删除
        </MenuItem>
        <Divider />
        <CopyToClipboard
          text={relPath}
          onCopy={() => {
            toast.success('已复制')
          }}
        >
          <MenuItem onClick={withClose()}>复制相对路径</MenuItem>
        </CopyToClipboard>
        <CopyToClipboard
          text={absPath}
          onCopy={() => {
            toast.success('已复制')
          }}
        >
          <MenuItem onClick={withClose()}>复制完整 URL</MenuItem>
        </CopyToClipboard>
      </Menu>
    )
  }
  return (
    <Menu open anchorEl={target} onClose={withClose()}>
      <MenuItem onClick={rename}>重命名</MenuItem>
      <MenuItem sx={{ color: theme.palette.error.main }} onClick={deleteItem}>
        删除
      </MenuItem>
      <Divider />
      <CopyToClipboard
        text={relPath}
        onCopy={() => {
          toast.success('已复制')
        }}
      >
        <MenuItem onClick={withClose()}>复制相对路径</MenuItem>
      </CopyToClipboard>
      <CopyToClipboard
        text={absPath}
        onCopy={() => {
          toast.success('已复制')
        }}
      >
        <MenuItem onClick={withClose()}>复制完整 URL</MenuItem>
      </CopyToClipboard>
    </Menu>
  )
}
