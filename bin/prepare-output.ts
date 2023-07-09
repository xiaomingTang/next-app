import fs from 'fs-extra'
import dotenv from 'dotenv'

import path from 'path'

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

async function main() {
  // 清空 out 目录
  fs.removeSync(p('out'))
  fs.mkdirSync(p('out'))

  fs.copySync(p('amplify.sh'), p('out/amplify.sh'))
  fs.copySync(p('amplify.yml'), p('out/amplify.yml'))
  fs.copySync(p('.npmrc'), p('out/.npmrc'))
  // 宝塔读不到 .env.local, 干脆就不复制过去了
  fs.copySync(p('public'), p('out/public'))
  fs.copySync(p('.next/standalone'), p('out'))
  fs.copySync(p('.next/cache'), p('out/.next/cache'))
  fs.copySync(p('.next/server'), p('out/.next/server'))
  fs.copySync(p('.next/static'), p('out/.next/static'))
  fs.copySync(p('bin/runtime-scripts'), p('out/bin/runtime-scripts'))

  // 配置 dotenv, 因为宝塔没办法通过命令行传 .env 文件写 env
  fs.copySync(p('node_modules/dotenv'), p('out/node_modules/dotenv'))
  const serverStr = fs.readFileSync(p('out/server.js'), 'utf-8')
  fs.writeFileSync(
    p('out/server.js'),
    `require("./bin/runtime-scripts/pre-run.js");${serverStr}`
  )

  // 宝塔会自动(无法禁止) install package.json 的 deps, 所以直接删掉 deps
  const packageJson = fs.readJSONSync(p('out/package.json'))
  packageJson.dependencies = []
  packageJson.devDependencies = []
  packageJson.peerDependencies = []
  fs.writeJSONSync(p('out/package.json'), packageJson, {
    spaces: 2,
  })

  // 读取 .env 文件, 将其所需 key 依次写入到 out/.env 中,
  // value 为当前环境变量值
  // 该 .env 文件用于提供运行时环境变量
  // 同样处理 .env 文件
  const localEnvStr = fs.readFileSync(p('.env'))
  // 先清空 .env 文件
  fs.writeFileSync(p('.env'), '', {
    flag: 'w',
  })
  fs.writeFileSync(p('out/.env'), '', {
    flag: 'w',
  })
  const requiredEnvObj = dotenv.parse(localEnvStr)
  Object.keys(requiredEnvObj).forEach((k) => {
    const v = process.env[k] ?? requiredEnvObj[k] ?? ''
    fs.writeFileSync(p('.env'), `${k}=${v}\n`, {
      flag: 'a',
    })
    fs.writeFileSync(p('out/.env'), `${k}=${v}\n`, {
      flag: 'a',
    })
    console.log('[log .env]', k, v)
  })
}

main()
