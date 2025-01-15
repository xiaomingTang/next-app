'use client'

import { FileExplorerTreeItem } from './FileExplorer'
import { TreeContextMenu } from './TreeContextMenu'

import { treeMap, type ProjectTree } from '../utils/arrayToTree'
import { updateProject } from '../server'

import { useListen } from '@/hooks/useListen'
import { cat } from '@/errors/catchAndToast'
import { SA, toError, type PlainError } from '@/errors/utils'
import { useUser } from '@/user'

import { RichTreeView, useTreeViewApiRef } from '@mui/x-tree-view'
import { useEffect, useRef, useState } from 'react'
import {
  Box,
  CircularProgress,
  IconButton,
  useColorScheme,
} from '@mui/material'
import Editor from '@monaco-editor/react'
import RefreshIcon from '@mui/icons-material/Refresh'
import { sleepMs } from '@zimi/utils'

import type { LoadingAble } from '@/components/ServerComponent'

type ProjectPageProps = LoadingAble<{
  projectTree: ProjectTree
  paths: string[]
}> & {
  error?: PlainError
}

const now = new Date()

const loadingTreeData: [ProjectTree] = [
  {
    hash: 'LOADING',
    type: 'DIR',
    createdAt: now,
    updatedAt: now,
    name: '加载中...',
    parentHash: 'LOADING',
    children: [],
    creatorId: 0,
  },
]

const errorTreeData: [ProjectTree] = [
  {
    hash: 'ERROR',
    type: 'DIR',
    createdAt: now,
    updatedAt: now,
    name: '加载出错',
    parentHash: 'ERROR',
    children: [],
    creatorId: 0,
  },
]

const getItemId = (item: { hash: string }) => item.hash
const getItemLabel = (item: { name: string }) => item.name

export function ProjectPage(projectInfo: ProjectPageProps) {
  const user = useUser()
  const editable =
    user.id === projectInfo.projectTree?.creatorId || user.role === 'ADMIN'
  const { mode } = useColorScheme()
  const [menuTreeData, setMenuTreeData] = useState(loadingTreeData)
  const apiRef = useTreeViewApiRef()
  const rootId = menuTreeData[0].hash
  const selectedItemRef = useRef<ProjectTree | null>(null)
  const [selectedItem, setSelectedItem] = useState<ProjectTree | null>(null)
  const [contextTarget, setContextTarget] = useState<HTMLElement | null>(null)
  const prevNameMapRef = useRef<{ [key: string]: string }>({})

  useListen(selectedItem, (item) => {
    selectedItemRef.current = item
  })

  useEffect(() => {
    if (projectInfo.error) {
      setMenuTreeData(errorTreeData)
      return
    }
    if (projectInfo.loading) {
      setMenuTreeData(loadingTreeData)
      return
    }
    setMenuTreeData([projectInfo.projectTree])
  }, [projectInfo])

  const onUpdate = (id: string, newProject: ProjectTree) => {
    setMenuTreeData(([prevTree]) => [
      treeMap(prevTree, (item) => {
        if (item.hash === id) {
          return {
            ...item,
            ...newProject,
          }
        }
        return item
      }),
    ])
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
      }}
      onContextMenu={cat(async (e) => {
        e.preventDefault()
        e.stopPropagation()
        const rootElem = apiRef.current?.getItemDOMElement(rootId)
        const target = [...(rootElem?.children ?? [])].find((elem) =>
          elem.classList.contains('content')
        ) as HTMLElement | null
        if (!target) {
          throw new Error('根 DOM 节点未找到')
        }
        // select the item manually
        target.click()
        // 避免目录被收起
        await sleepMs(1)
        target.click()
        setContextTarget(target)
      })}
    >
      <Box
        key={menuTreeData[0].hash}
        sx={{
          height: '100%',
          width: '15%',
          minWidth: '240px',
          maxWidth: '400px',
          overflowY: 'auto',
        }}
      >
        <RichTreeView
          apiRef={apiRef}
          items={menuTreeData}
          getItemId={getItemId}
          getItemLabel={getItemLabel}
          slots={{ item: FileExplorerTreeItem }}
          isItemEditable={
            editable && !projectInfo.error && !projectInfo.loading
          }
          experimentalFeatures={{ labelEditing: editable }}
          defaultExpandedItems={[rootId]}
          onSelectedItemsChange={(e, itemId) => {
            setSelectedItem(
              apiRef.current?.getItem(itemId ?? '__NOT_EXIST_ID__')
            )
          }}
          onItemLabelChange={cat(async (itemId, newLabel) => {
            if (prevNameMapRef.current[itemId]) {
              delete prevNameMapRef.current[itemId]
              return
            }
            const prevItem = apiRef.current?.getItem(itemId)
            const prevLabel: string = prevItem?.name ?? newLabel
            if (!prevItem || prevLabel === newLabel) {
              return
            }
            try {
              const res = await updateProject({
                hash: itemId,
                name: newLabel,
              }).then(SA.decode)
              onUpdate(itemId, {
                ...prevItem,
                name: res.name,
              })
            } catch (err) {
              const error = toError(err)
              prevNameMapRef.current[itemId] = prevLabel
              apiRef.current?.updateItemLabel(itemId, prevLabel)
              throw new Error(
                `【${prevLabel}】重命名为【${newLabel}】失败：${error.message}`
              )
            }
          })}
          slotProps={{
            item: {
              onContextMenu: cat(async (e) => {
                e.preventDefault()
                e.stopPropagation()
                const target = e.target as HTMLElement
                // select the item manually
                target.click()
                // 避免目录被收起
                await sleepMs(1)
                target.click()
                const item = selectedItemRef.current
                if (!item) {
                  throw new Error('未选中任何项目')
                }
                setContextTarget(target)
              }),
            },
          }}
        />
        {projectInfo.error && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              pt: 2,
            }}
          >
            <IconButton onClick={() => window.location.reload()}>
              <RefreshIcon />
            </IconButton>{' '}
          </Box>
        )}
      </Box>
      <Box
        sx={{
          width: '0%',
          flexGrow: 1,
        }}
      >
        {/* TODO: 文件名栏 & loading 放文件名上 */}
        <Editor
          key={
            projectInfo.projectTree?.hash ||
            projectInfo.error?.message ||
            'loading'
          }
          theme={mode === 'dark' ? 'vs-dark' : 'light'}
          defaultLanguage='markdown'
          defaultValue={
            projectInfo.error
              ? `加载出错：${projectInfo.error.message}`
              : '加载中...'
          }
          loading={
            <Box sx={{ display: 'flex' }}>
              <CircularProgress size='24px' />
            </Box>
          }
          options={{
            tabSize: 2,
            lineNumbers: projectInfo.projectTree ? 'on' : 'off',
            placeholder: `输入内容 - ctrl + S 以保存`,
            readOnly: !editable || projectInfo.loading || !!projectInfo.error,
            scrollBeyondLastLine: true,
            minimap: {
              enabled: !!projectInfo.projectTree,
            },
            scrollbar: {
              alwaysConsumeMouseWheel: false,
            },
          }}
        />
      </Box>
      <TreeContextMenu
        apiRef={apiRef}
        item={selectedItem}
        root={menuTreeData[0]}
        target={contextTarget}
        setTarget={setContextTarget}
        onUpdate={onUpdate}
        mode={editable ? 'edit' : 'view'}
      />
    </Box>
  )
}
