const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

const root = process.cwd()

function p(...paths) {
  return path.normalize(path.join(root, ...paths))
}

dotenv.config({
  path: p('.env.local'),
})
dotenv.config({
  path: p('.env'),
})

function requireJsonOrCatch(f) {
  try {
    return require(f)
  } catch (e) {
    console.warn(`config file not found: ${f}`)
    return {}
  }
}

// 可以考虑加 deep merge
function getEnvConfig(env) {
  return {
    ...requireJsonOrCatch(`./public-config/common.json`),
    ...requireJsonOrCatch(`./public-config/${env}.json`),
    ...requireJsonOrCatch(`./public-config/local.json`),
    appEnv: env,
  }
}

function writeEnvVars() {
  const localEnvStr = fs.readFileSync(p('.env'))
  const requiredEnvObj = dotenv.parse(localEnvStr)
  // 先清空 .env 文件
  fs.writeFileSync(p('.env'), '', {
    flag: 'w',
  })
  // 再重写 .env 文件(目的是将命令行中的环境变量写入到 .env 文件中)
  Object.keys(requiredEnvObj).forEach((k) => {
    const v = process.env[k] ?? requiredEnvObj[k] ?? ''
    fs.writeFileSync(p('.env'), `${k}=${v}\n`, {
      flag: 'a',
    })
  })
}

function writeEnvConfig(env) {
  const jsFile = p('public/__ENV_CONFIG__.js')
  const jsContent = `globalThis.__ENV_CONFIG__ = ${JSON.stringify(
    getEnvConfig(env)
  )};\n`
  fs.writeFileSync(jsFile, jsContent)
  console.log(`env config written into ${jsFile}`)

  const typeFile = p('public/__ENV_CONFIG__.d.ts')
  const typeContent = `const VALUE_OF__ENV_CONFIG__ = ${JSON.stringify(
    getEnvConfig(env)
  )};
declare global {
  var __ENV_CONFIG__: typeof VALUE_OF__ENV_CONFIG__ & {
    appEnv: "preprod" | "production";
  };
}
export {};
`
  fs.writeFileSync(typeFile, typeContent)
  console.log(`env config type written into ${typeFile}`)
}

function main() {
  writeEnvVars()
  writeEnvConfig(process.env.NEXT_PUBLIC_APP_ENV)
}

main()
