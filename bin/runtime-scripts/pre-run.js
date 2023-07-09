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

function writeEnv(env) {
  const jsFile = path.resolve(process.cwd(), 'public/__ENV_CONFIG__.js')
  const jsContent = `globalThis.__ENV_CONFIG__ = ${JSON.stringify(
    getEnvConfig(env)
  )};\n`
  fs.writeFileSync(jsFile, jsContent)
  console.log(`env config written into ${jsFile}`)

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
  console.log(`env config type written into ${typeFile}`)
}

function main() {
  writeEnv(process.env.NEXT_PUBLIC_APP_ENV)
}

main()
