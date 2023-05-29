const fs = require('fs')
const path = require('path')

require('dotenv').config({
  path: path.resolve(process.cwd(), '.env.local'),
})
require('dotenv').config({
  path: path.resolve(process.cwd(), '.env'),
})

function requireJsonOrCatch(f) {
  try {
    return require(f)
  } catch (e) {
    console.warn(`\x1b[33mconfig file not found: ${f}\x1b[0m`)
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

function writeEnv(env) {
  const jsFile = path.resolve(process.cwd(), 'public/__ENV_CONFIG__.js')
  const jsContent = `globalThis.__ENV_CONFIG__ = ${JSON.stringify(
    getEnvConfig(env)
  )};\n`
  fs.writeFileSync(jsFile, jsContent)
  console.log(`\x1b[32menv config written into ${jsFile}\x1b[0m`)

  const typeFile = path.resolve(process.cwd(), 'public/__ENV_CONFIG__.d.ts')
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
  console.log(`\x1b[32menv config type written into ${typeFile}\x1b[0m`)
}

function main() {
  writeEnv(process.env.NEXT_PUBLIC_APP_ENV)
}

main()
