import dotenv from 'dotenv'

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const root = process.cwd()

function p(...paths: string[]) {
  return path.normalize(path.join(root, ...paths))
}

dotenv.config({
  path: p('.env.local'),
})
dotenv.config({
  path: p('.env'),
})

function getLastCommit() {
  try {
    const commitMsg = execSync(
      `git log -1 --pretty=format:'%h: %s' HEAD`
    ).toString()
    return commitMsg.replace(/\n/g, ' ')
  } catch (error) {
    // pass
    return ''
  }
}

function writeEnvVars() {
  const localEnvStr = fs.readFileSync(p('.env'))
  const requiredEnvObj = dotenv.parse(localEnvStr)
  // 先清空 .env 文件
  fs.writeFileSync(p('.env'), '', {
    flag: 'w',
  })
  const lastCommit = getLastCommit()
  if (lastCommit) {
    requiredEnvObj.NEXT_PUBLIC_LAST_COMMIT_MESSAGE = lastCommit
  }
  // 再重写 .env 文件(目的是将命令行中的环境变量写入到 .env 文件中)
  Object.keys(requiredEnvObj).forEach((k) => {
    const v = process.env[k] || requiredEnvObj[k] || ''
    fs.writeFileSync(p('.env'), `${k}=${v}\n`, {
      flag: 'a',
    })
  })
}

function main() {
  if (process.env.WRITE_DOT_ENV === 'true') {
    writeEnvVars()
  }
}

main()
