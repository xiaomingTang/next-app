/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_ORIGIN,
  generateRobotsTxt: true,
  transform: (config, url) => ({
    loc: encodeURI(url),
    lastmod: new Date().toISOString(),
  }),
}
