import * as path from 'path'

const ROOT = process.cwd()

function resolveRoot(...p) {
  return path.resolve(ROOT, ...p)
}

function addSvgLoader(config) {
  // svg loader
  // https://react-svgr.com/docs/webpack/#use-svgr-and-asset-svg-in-the-same-project
  // https://github.com/gregberge/svgr/issues/860#issuecomment-1653928947
  const nextImageLoaderRule = config.module.rules.find((rule) =>
    rule.test?.test?.('.svg')
  )

  nextImageLoaderRule.resourceQuery = {
    not: [...nextImageLoaderRule.resourceQuery.not, /icon/],
  }

  config.module.rules.push({
    resourceQuery: /icon/, // *.svg?icon
    issuer: nextImageLoaderRule.issuer,
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
  })
}

/** @type {import('next').NextConfig['webpack']} */
export const webpackConfig = (config, { dev }) => {
  addSvgLoader(config)

  config.module.rules.push({
    test: /\.sql$/,
    use: 'raw-loader',
  })

  config.resolve.alias['@'] = resolveRoot('src')
  config.resolve.alias['@APP'] = resolveRoot('src/app')
  config.resolve.alias['@ADMIN'] = resolveRoot('src/app/admin')
  config.resolve.alias['@D'] = resolveRoot('src/app/(default-layout)')
  config.resolve.alias['@F'] = resolveRoot('src/app/(fullscreen-layout)')
  config.resolve.alias['@I'] = resolveRoot('src/app/(iframe-layout)')
  config.resolve.alias['@ROOT'] = resolveRoot()

  return config
}
