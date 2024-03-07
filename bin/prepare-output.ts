import fs from 'fs-extra'

import path from 'path'

const root = process.cwd()

function p(...paths: string[]) {
  return path.normalize(path.join(root, ...paths))
}

async function main() {
  // 清空 out 目录
  fs.removeSync(p('out'))
  fs.mkdirSync(p('out'))

  fs.copySync(p('.env'), p('out/.env'))
  fs.copySync(p('.npmrc'), p('out/.npmrc'))
  fs.copySync(p('README.md'), p('out/README.md'))
  fs.copySync(p('launch.sh'), p('out/launch.sh'))
  fs.copySync(p('bin'), p('out/bin'))
  fs.copySync(p('public'), p('out/public'))
  fs.copySync(p('.next/standalone'), p('out'))
  fs.copySync(p('.next/cache'), p('out/.next/cache'))
  fs.copySync(p('.next/server'), p('out/.next/server'))
  fs.copySync(p('.next/static'), p('out/.next/static'))

  // 配置 dotenv, 因为宝塔没办法通过命令行传 .env 文件写 env
  fs.copySync(p('node_modules/dotenv'), p('out/node_modules/dotenv'))

  // 宝塔会自动(无法禁止) install package.json 的 deps, 所以直接删掉 deps
  const packageJson = fs.readJSONSync(p('out/package.json'))
  packageJson.dependencies = []
  packageJson.devDependencies = []
  packageJson.peerDependencies = []
  fs.writeJSONSync(p('out/package.json'), packageJson, {
    spaces: 2,
  })
}

main()
