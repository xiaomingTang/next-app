import nextPwa from 'next-pwa'
import runtimeCaching from 'next-pwa/cache.js'
import { webpackConfig } from './utils/index.mjs'
import imageConfig from './next-image.config.js'
import NextBundleAnalyzer from '@next/bundle-analyzer'
const withBundleAnalyzer = NextBundleAnalyzer({
  enabled:
    process.env.ANALYZE === 'true' && process.env.NODE_ENV === 'production',
})

const withPWA = nextPwa({
  dest: 'public',
  // disable pwa
  disable: true,
  // disable cache start url: [discussion of use case to not cache start url at all](https://github.com/shadowwalker/next-pwa/pull/296#issuecomment-1094167025)
  cacheStartUrl: false,
  publicExcludes: [
    // 静态资源不 precache
    '!static/**/*',
    // 不同设备需要不同的资源, 让设备自己去取, 不用 precache
    '!pwa/**/*',
  ],
  buildExcludes: [
    // 所有资源包括 `fonts` 都不 precache
    /media\/.*$/,
    // @WARNING: 会阻止 precache 所有 js/css 文件
    // 是一个 trade off (关于首次加载资源量)
    // /chunks\/.*$/,
    // Solution: https://github.com/shadowwalker/next-pwa/issues/424#issuecomment-1399683017
    'app-build-manifest.json',
  ],
  runtimeCaching,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  images: imageConfig.images,
  webpack: webpackConfig,
  experimental: {
    serverActions: true,
  },
  async headers() {
    return [
      {
        source: '/(pwa|scripts|static)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, must-revalidate',
          },
        ],
      },
      {
        source: '/(__ENV_CONFIG__\\.js|manifest\\.json|favicon.ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, must-revalidate',
          },
        ],
      },
    ]
  },
}

export default withBundleAnalyzer(withPWA(nextConfig))
