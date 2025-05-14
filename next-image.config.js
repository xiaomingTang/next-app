/** @type {import('next/dist/shared/lib/image-config').ImageConfig} */
module.exports = {
  minimumCacheTTL: 60 * 60,
  domains: ['cdn.16px.cc', '16px.cc'],
  remotePatterns: [
    new URL('https://cdn.16px.cc/**'),
    new URL('https://16px.cc/**'),
  ],
}
