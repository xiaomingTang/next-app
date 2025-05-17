import { completion } from './utils'

import { ShDir } from '../ShAsset'
import { resolvePath } from '../utils/path'

import type { ShFile } from '../ShAsset'
import type { ShTerminal } from '../ShTerminal'

/**
 * 命令补全
 */
export function commandCompletion(e: string, vt: ShTerminal) {
  // TAB
  if (e !== '\t') {
    return
  }
  const trimedCmd = vt.command.trim()
  // 如果没有命令，或者命令后面有空格，则不补全
  if (!trimedCmd || vt.command.endsWith(' ')) {
    return
  }
  const commandKeys = Object.keys(vt.commands)
  const rest = completion(trimedCmd, commandKeys)
  if (rest.length === 0) {
    return
  }
  vt.xterm.input(`${rest.join('')} `)
}

/**
 * 路径补全
 */
export async function pathCompletion(e: string, vt: ShTerminal) {
  // TAB
  if (e !== '\t') {
    return
  }
  const trimedCmd = vt.command.trim()
  // 没有命令则不补全
  if (!trimedCmd) {
    return
  }
  const contextPath = vt.fileSystem.context.path
  let children: (ShFile | ShDir)[] = []
  if (/\s$/.test(vt.command)) {
    children = await vt.spinner.runWithLoading(() =>
      vt.fileSystem.listDir(contextPath).catch(() => [])
    )
    vt.debug('completion 候选: ', children)
    if (children.length === 0) {
      return
    }
    if (children.length === 1) {
      const item = children[0]
      const name = item.name
      vt.xterm.input(`${name}${ShDir.isDir(item) ? '/' : ' '}`)
      return
    }
    const suffix = completion(
      '',
      children.map((item) => item.name)
    ).join('')
    vt.debug('completion 待补全 suffix: ', suffix)
    if (suffix) {
      vt.xterm.input(suffix)
      const item = children.find((item) => item.name === suffix)
      if (item) {
        if (ShDir.isDir(item)) {
          vt.xterm.input('/')
        } else {
          vt.xterm.input(' ')
        }
      }
    }
    return
  }
  const cmdPieces = vt.command.split(/\s+/g).filter(Boolean)
  if (cmdPieces.length < 2) {
    return
  }
  const lastItem = cmdPieces[cmdPieces.length - 1]
  if (lastItem.startsWith('-')) {
    // 如果是选项，则不补全
    return
  }
  let firstPathPiece = ''
  if (!lastItem.includes('/')) {
    firstPathPiece = '.'
  } else if (lastItem.lastIndexOf('/') === 0) {
    firstPathPiece = '/'
  } else {
    firstPathPiece = lastItem.slice(0, lastItem.lastIndexOf('/'))
  }
  // if (lastPathSlice.includes('/')) {

  // }
  // lastItem.lastIndexOf('/') === 0
  //   ? '/'
  //   : lastItem.slice(0, lastItem.lastIndexOf('/'))
  vt.debug('completion lastItem: ', lastItem)
  vt.debug('completion firstPathPiece: ', firstPathPiece)
  children = await vt.spinner.runWithLoading(() =>
    vt.fileSystem
      .listDir(resolvePath(contextPath, firstPathPiece))
      .catch(() => [])
  )
  vt.debug('completion 候选: ', children)
  if (children.length === 0) {
    return
  }
  const prefix =
    resolvePath(contextPath, lastItem) + (lastItem.endsWith('/') ? '/' : '')
  children = children.filter((item) => item.path.startsWith(prefix))
  vt.debug('completion 前缀: ', prefix)
  vt.debug('completion 前缀过滤后的候选: ', children)
  const suffix = completion(
    prefix,
    children.map((item) => item.path)
  ).join('')
  vt.debug('completion 待补全 suffix: ', suffix)
  if (suffix && suffix !== '/') {
    vt.xterm.input(suffix)
    const name = (prefix + suffix).split('/').pop()
    vt.debug('completion 待补全 name: ', name)
    if (!name) {
      return
    }
    const item = children.find((item) => item.name === name)
    vt.debug('completion 待补全 item: ', item)
    if (item) {
      if (ShDir.isDir(item)) {
        vt.xterm.input('/')
      } else {
        vt.xterm.input(' ')
      }
    }
  }
}
