// 该文件用于自动从 componentRoot 目录中自动生成导出文件, 免于手动 import export
import Case from 'case'

import path from 'path'
import fs from 'fs'

const appRoot = process.cwd()
const componentRoot = path.resolve(appRoot, 'src/svg')
const svgFilesRoot = path.resolve(componentRoot, 'assets')
const output = path.resolve(componentRoot, 'index.ts')
const COMPONENT_NAME_PREFIX = 'Svg'

function geneSvgInterface() {
  const nameMap: Record<string, string> = {}
  fs.readdirSync(svgFilesRoot).forEach((fullFileName) => {
    const filePath = path.resolve(svgFilesRoot, fullFileName)
    let relativePath = path
      .relative(path.dirname(output), filePath)
      .replace(/\\/g, '/')
    if (!relativePath.startsWith('.')) {
      relativePath = `./${relativePath}`
    }
    // 后缀, 如 '.svg'
    const ext = path.extname(fullFileName)
    // 文件名, 不含后缀
    const name = path.basename(fullFileName, '.svg')
    // 该组件变量名
    // 文件名简单粗暴转成 PascalCase, 然后移除掉底划线
    // (因为部分场景会生成底划线, 如'ab-cd-5', 会被转成 'AbCd_5')
    // (而 eslint 不建议变量名中使用底划线)
    const displayName = Case.pascal(name).replace(/_/g, '')
    if (ext === '.svg') {
      if (nameMap[displayName]) {
        throw new Error(
          `该 display name(${displayName}) 已存在, 文件路径为 ${filePath}, 请修改文件名.`
        )
      }
      nameMap[displayName] =
        `export { default as ${COMPONENT_NAME_PREFIX}${displayName} } from '${relativePath}?icon'`
    } else if (fullFileName !== '.DS_Store') {
      console.error(`[${fullFileName} is not a .svg file]: ${filePath}`)
    }
  })

  const content = Object.values(nameMap).join('\n')
  if (content) {
    fs.writeFileSync(output, `${content}\n`, { flag: 'w' })
    console.info(`info of .svg files has been write into [ ${output} ]`)
  } else {
    console.error('no available .svg file')
  }
}

geneSvgInterface()

export {}
