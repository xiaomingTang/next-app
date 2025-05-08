import * as path from 'path'

const ROOT = process.cwd()

function resolveRoot(...p) {
  return path.resolve(ROOT, ...p)
}

/** @type {import('next').NextConfig['webpack']} */
function addSvgLoader(config) {
  // svg loader
  // https://react-svgr.com/docs/webpack/#use-svgr-and-asset-svg-in-the-same-project
  // https://github.com/gregberge/svgr/issues/860#issuecomment-1653928947
  const nextImageLoaderRule = config.module.rules.find((rule) =>
    rule.test?.test?.('.svg')
  )

  config.module.rules.push(
    // Reapply the existing rule, but only for svg imports ending in ?url
    {
      ...nextImageLoaderRule,
      test: /\.svg$/i,
      resourceQuery: /url/, // *.svg?url
    },
    // Convert all other *.svg imports to React components
    {
      test: /\.svg$/i,
      issuer: nextImageLoaderRule.issuer,
      resourceQuery: { not: [...nextImageLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            ref: true,
            // https://react-svgr.com/docs/options/#dimensions
            dimensions: false,
            svgProps: {
              width: '1em',
              height: '1em',
              display: 'inline-block',
              fill: 'currentColor',
              focusable: 'false',
              color: 'inherit',
              fontSize: 'inherit',
              'data-generated-svg': '',
              'aria-hidden': 'true',
            },
          },
        },
      ],
    }
  )

  // Modify the file loader rule to ignore *.svg, since we have it handled now.
  nextImageLoaderRule.exclude = /\.svg$/i

  return config
}

/** @type {import('next').NextConfig['webpack']} */
function addWasmLoader(config, { isServer, dev }) {
  config.module.rules.push({
    test: /\.wasm$/,
    type: 'asset/resource',
    generator: {
      filename: 'static/wasm/[name].[hash][ext]',
    },
  })

  // Since Webpack 5 doesn't enable WebAssembly by default, we should do it manually
  config.experiments = { ...config.experiments, asyncWebAssembly: true };
}

/** @type {import('next').NextConfig['webpack']} */
export const webpackConfig = (config, ctx) => {
  addSvgLoader(config, ctx)
  addWasmLoader(config, ctx)

  config.module.rules.push({
    test: /\.(sql|txt)$/,
    use: 'raw-loader',
  })

  config.resolve.alias['@'] = resolveRoot('src')
  config.resolve.alias['@ADMIN'] = resolveRoot('src/app/admin')
  config.resolve.alias['@D'] = resolveRoot('src/app/(default-layout)')
  config.resolve.alias['@F'] = resolveRoot('src/app/(fullscreen-layout)')
  config.resolve.alias['@I'] = resolveRoot('src/app/(iframe-layout)')
  config.resolve.alias['@ROOT'] = resolveRoot()
  config.resolve.alias['@WASM'] = resolveRoot('src/wasm')

  return config
}
