import { webpackConfig } from './utils/index.mjs'
import imageConfig from './next-image.config.js'
import NextBundleAnalyzer from '@next/bundle-analyzer'
const withBundleAnalyzer = NextBundleAnalyzer({
  enabled:
    process.env.ANALYZE === 'true' && process.env.NODE_ENV === 'production',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  images: imageConfig,
  webpack: webpackConfig,
  transpilePackages: ['next-mdx-remote'],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  async headers() {
    /**
     * scripts & static 里面的内容不应该变化 (实在要变就改名)
     *
     * pwa & __ENV_CONFIG__ & manifest & favicon 可能会变,
     * 所以使用 no-cache (每次使用都需要验证);
     */
    return [
      {
        source: '/(scripts|static)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'max-age=31536000',
          },
        ],
      },
      {
        source: '/pwa/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'max-age=31536000, no-cache',
          },
        ],
      },
      {
        source: '/(manifest\\.json|favicon\\.ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'max-age=31536000, no-cache',
          },
        ],
      },
      // 对爬虫屏蔽含 _rsc 参数的请求
      {
        source: '/:path*',
        has: [
          {
            type: 'query',
            key: '_rsc',
          },
        ],
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      // 对爬虫屏蔽 /api 路由
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ]
  },
  redirects: () => [
    {
      source: '/about',
      destination: '/blog/3EpPJTM2LwB_',
      permanent: false,
    },
    {
      source: '/qrcode/generate',
      destination: 'https://cli.im/',
      permanent: false,
    },
  ],
  experimental: {
    serverActions: {
      // .host 带有端口
      allowedOrigins: [new URL(process.env.NEXT_PUBLIC_ORIGIN).host],
    },
  },
}

export default withBundleAnalyzer(nextConfig)
