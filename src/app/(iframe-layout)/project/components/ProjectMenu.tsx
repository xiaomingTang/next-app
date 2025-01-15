'use client'

import { FileExplorerTreeItem } from './FileExplorer'
import { TreeContextMenu } from './TreeContextMenu'

import {
  findItemByPath,
  findItemListByPath,
  treeMap,
  type ProjectTree,
} from '../utils/arrayToTree'
import { updateProject } from '../server'
import { getRelPath } from '../utils/getRelPath'
import { useProjectPath } from '../utils/useProjectPath'
import { errorTreeData, isValidTree, loadingTreeData } from '../utils/initTree'

import { cat } from '@/errors/catchAndToast'
import { SA, toError } from '@/errors/utils'
import { useUser } from '@/user'
import { useListen } from '@/hooks/useListen'

import { RichTreeView, useTreeViewApiRef } from '@mui/x-tree-view'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, IconButton } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { sleepMs } from '@zimi/utils'

import type { ProjectPageProps } from './ProjectPage'

const getItemId = (item: { hash: string }) => item.hash
const getItemLabel = (item: { name: string }) => item.name

export function ProjectMenu(projectInfo: ProjectPageProps) {
  const user = useUser()
  const editable =
    user.id === projectInfo.projectTree?.creatorId || user.role === 'ADMIN'
  const [menuTreeData, setMenuTreeData] = useState(loadingTreeData)
  const apiRef = useTreeViewApiRef()
  const rootId = menuTreeData[0].hash
  const selectedItemRef = useRef<ProjectTree | null>(null)
  const [selectedItem, setSelectedItem] = useState<ProjectTree | null>(null)
  const [contextTarget, setContextTarget] = useState<HTMLElement | null>(null)
  const prevNameMapRef = useRef<{ [key: string]: string }>({})
  const items = useMemo(
    () => findItemListByPath(menuTreeData[0], projectInfo.paths ?? []),
    [menuTreeData, projectInfo.paths]
  )
  const defaultSelectedItem = useMemo(
    () => findItemByPath(menuTreeData[0], projectInfo.paths ?? []),
    [menuTreeData, projectInfo.paths]
  )

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
    if (newProject.type !== 'DIR') {
      // 点击一下文件，以便更新当前路由
      apiRef.current?.getItemDOMElement(id)?.click()
    }
  }

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

  return (
    <>
      <Box
        key={menuTreeData[0].hash}
        sx={{
          height: '100%',
          width: '15%',
          minWidth: '240px',
          maxWidth: '400px',
          overflowY: 'auto',
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
        <RichTreeView
          key={items.map((item) => item.hash).join(',')}
          apiRef={apiRef}
          items={menuTreeData}
          getItemId={getItemId}
          getItemLabel={getItemLabel}
          slots={{ item: FileExplorerTreeItem }}
          isItemEditable={
            editable && !projectInfo.error && !projectInfo.loading
          }
          experimentalFeatures={{ labelEditing: editable }}
          defaultExpandedItems={items.map((item) => item.hash)}
          defaultSelectedItems={defaultSelectedItem?.hash}
          onSelectedItemsChange={(e, itemId) => {
            const root = menuTreeData[0]
            if (!isValidTree(root)) {
              return
            }
            const curSelectedItem: ProjectTree | null | undefined =
              apiRef.current?.getItem(itemId ?? '__NOT_EXIST_ID__')
            if (!curSelectedItem) {
              return
            }
            setSelectedItem(curSelectedItem)
            if (curSelectedItem.type === 'DIR') {
              return
            }
            const relPath = getRelPath(curSelectedItem, root)
            useProjectPath.replace(relPath)
          }}
          onItemLabelChange={cat(async (itemId, newLabel) => {
            if (prevNameMapRef.current[itemId]) {
              delete prevNameMapRef.current[itemId]
              return
            }
            const prevItem: ProjectTree | null | undefined =
              apiRef.current?.getItem(itemId)
            const prevLabel = prevItem?.name ?? newLabel
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
      <TreeContextMenu
        apiRef={apiRef}
        item={selectedItem}
        root={menuTreeData[0]}
        target={contextTarget}
        setTarget={setContextTarget}
        onUpdate={onUpdate}
        mode={editable ? 'edit' : 'view'}
      />
    </>
  )
}
