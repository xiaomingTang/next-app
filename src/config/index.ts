import manifest from '@ROOT/public/manifest.json'

export const ENV_CONFIG = {
  public: {
    origin: new URL(process.env.NEXT_PUBLIC_ORIGIN || '').origin,
    nodeEnv: process.env.NODE_ENV,
  },
  manifest,
}

export const STYLE = {
  width: {
    desktop: 1024,
  },
  zIndex: {
    canvasHtml: 899,
  },
}

// 颜色见 https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
console.log(`[origin: ${ENV_CONFIG.public.origin}]`)
