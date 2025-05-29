import { renameProject } from './RenameModal'
import { editNetworkFile } from './EditNetworkFileModal'

import { getRelPath } from '../utils/getRelPath'
import {
  createProject,
  deleteProject,
  getProjectContent,
  projectClipboardAction,
} from '../server'
import { useProjectClipboardAction } from '../utils/useProjectClipboardAction'

import { cat } from '@/errors/catchAndToast'
import { customConfirm } from '@/utils/customConfirm'
import { SA } from '@/errors/utils'
import { resolvePath } from '@/utils/url'
import { copyToClipboard } from '@/utils/copyToClipboard'

import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  useTheme,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import ContentCut from '@mui/icons-material/ContentCut'
import ContentCopy from '@mui/icons-material/ContentCopy'
import ContentPaste from '@mui/icons-material/ContentPaste'
import TextSnippetIcon from '@mui/icons-material/TextSnippet'
import FolderIcon from '@mui/icons-material/Folder'
import InsertLinkIcon from '@mui/icons-material/InsertLink'

import type { ProjectTree } from '../utils/arrayToTree'

export function TreeContextMenu({
  target,
  setTarget,
  item,
  root,
  onUpdate,
  mode,
}: {
  target: HTMLElement | null
  setTarget: React.Dispatch<React.SetStateAction<HTMLElement | null>>
  item: ProjectTree | null
  root: ProjectTree
  onUpdate: (id: string, newProject: ProjectTree) => void | Promise<void>
  mode: 'edit' | 'view'
}) {
  const { action: clipboardAction, data: clipboardData } =
    useProjectClipboardAction()
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
  const isDir = item.type === 'DIR'
  const isText = item.type === 'TEXT'
  const deleteItem = withClose(
    cat(async () => {
      if (isRoot) {
        if (await customConfirm('是否删除整个项目', 'SLIGHT')) {
          await deleteProject({ hash: item.hash }).then(SA.decode)
          router.refresh()
        }
        return
      }
      if (isDir) {
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
  const rename = withClose(
    cat(async () => {
      const res = await renameProject(item)
      await onUpdate(res.hash, {
        ...item,
        ...res,
      })
    })
  )
  const createTextFile = withClose(
    cat(async () => {
      await createProject({
        name: '未命名.txt',
        parentHash: item.hash,
        type: 'TEXT',
      }).then(SA.decode)
      router.refresh()
    })
  )
  const createNetworkFile = withClose(
    cat(async () => {
      await editNetworkFile({ parentHash: item.hash })
      // 由于编辑网络文件有弹窗, useInjectHistory 会触发 history.back(), 会导致 router.refresh 应用失败, 所以这里延迟刷新
      window.setTimeout(() => {
        router.refresh()
      }, 500)
    })
  )
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
  const m剪切 = (
    <MenuItem
      key='剪切'
      onClick={withClose(() => {
        useProjectClipboardAction.cut({ type: item.type, hash: item.hash })
      })}
      disabled={isRoot}
    >
      <ListItemIcon>
        <ContentCut fontSize='small' />
      </ListItemIcon>
      <ListItemText>剪切</ListItemText>
    </MenuItem>
  )

  const m复制 = (
    <MenuItem
      key='复制'
      onClick={withClose(() => {
        useProjectClipboardAction.copy({ type: item.type, hash: item.hash })
      })}
      disabled={isRoot || item.type !== 'TEXT'}
    >
      <ListItemIcon>
        <ContentCopy fontSize='small' />
      </ListItemIcon>
      <ListItemText>复制</ListItemText>
    </MenuItem>
  )
  const m粘贴 = (
    <MenuItem
      key='粘贴'
      onClick={withClose(
        cat(async () => {
          if (!clipboardData) {
            throw new Error('剪贴板为空')
          }
          await projectClipboardAction({
            action: clipboardAction,
            hash: clipboardData.hash,
            parentHash: item.hash,
          }).then(SA.decode)
          useProjectClipboardAction.clear()
          router.refresh()
        })
      )}
    >
      <ListItemIcon>
        <ContentPaste fontSize='small' />
      </ListItemIcon>
      <ListItemText>粘贴</ListItemText>
    </MenuItem>
  )
  const m重命名 = (
    <MenuItem key='重命名' onClick={rename}>
      重命名
    </MenuItem>
  )
  const m删除 = (
    <MenuItem
      key='删除'
      sx={{ color: theme.palette.error.main }}
      onClick={deleteItem}
    >
      删除
    </MenuItem>
  )
  const m复制相对路径 = (
    <MenuItem
      key='复制相对路径'
      onClick={withClose(() => copyToClipboard(relPath))}
    >
      复制相对路径
    </MenuItem>
  )
  const m复制完整URL = (
    <MenuItem
      key='复制完整 URL'
      onClick={withClose(() => copyToClipboard(absPath))}
    >
      复制完整 URL
    </MenuItem>
  )
  const m新建 = [
    <MenuItem key='新建文本文件' onClick={createTextFile}>
      <ListItemIcon>
        <TextSnippetIcon fontSize='small' />
      </ListItemIcon>
      <ListItemText>新建文本文件</ListItemText>
    </MenuItem>,
    <MenuItem key='新建网络文件' onClick={createNetworkFile}>
      <ListItemIcon>
        <InsertLinkIcon fontSize='small' />
      </ListItemIcon>
      <ListItemText>新建网络文件</ListItemText>
    </MenuItem>,
    <MenuItem key='新建文件夹' onClick={createDir}>
      <ListItemIcon>
        <FolderIcon fontSize='small' />
      </ListItemIcon>
      <ListItemText>新建文件夹</ListItemText>
    </MenuItem>,
  ]
  const m编辑该网络文件 = (
    <MenuItem
      onClick={withClose(
        cat(async () => {
          const content = await getProjectContent({
            hash: item.hash,
          }).then(SA.decode)
          const newProject = await editNetworkFile({
            project: {
              ...item,
              content: content || '',
            },
          })
          await onUpdate(item.hash, {
            ...item,
            ...newProject,
          })
        })
      )}
    >
      <ListItemIcon>
        <InsertLinkIcon fontSize='small' />
      </ListItemIcon>
      <ListItemText>编辑该网络文件</ListItemText>
    </MenuItem>
  )

  return (
    <Menu open anchorEl={target} onClose={withClose()}>
      {mode === 'edit' && [
        isDir && m新建,
        m重命名,
        m删除,
        <Divider key='d1' />,
        m剪切,
        m复制,
        isDir && !!clipboardData && m粘贴,
        <Divider key='d2' />,
        !isDir && !isText && m编辑该网络文件,
        !isDir && !isText && <Divider key='d3' />,
      ]}
      {m复制相对路径}
      {m复制完整URL}
    </Menu>
  )
}
