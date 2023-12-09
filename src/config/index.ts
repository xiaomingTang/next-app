import manifest from '@ROOT/public/manifest.json'

function getEnvConfig() {
  if (typeof window === 'undefined') {
    // eslint-disable-next-line global-require
    require('public/__ENV_CONFIG__')
  }
  return globalThis.__ENV_CONFIG__
}

export const ENV_CONFIG = {
  public: {
    ...getEnvConfig(),
    origin: new URL(process.env.NEXT_PUBLIC_ORIGIN || '').origin,
    nodeEnv: process.env.NODE_ENV,
  },
  manifest,
}

export const STYLE = {
  width: {
    desktop: 1024,
  },
}

// 颜色见 https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
console.log(`[appEnv: ${ENV_CONFIG.public.appEnv}]`)
console.log(`[origin: ${ENV_CONFIG.public.origin}]`)
