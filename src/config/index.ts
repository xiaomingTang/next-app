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
