interface PathItem {
  pathname: string
  title: string
}

export const toolList: PathItem[] = [
  { pathname: '/pano', title: '全景看看' },
  { pathname: '/clock', title: '时钟橱窗' },
  { pathname: '/level', title: '在线水平仪' },
  { pathname: '/cid', title: '随机生成身份证' },
  { pathname: '/peer', title: 'peer' },
  { pathname: '/wallpaper', title: '壁纸' },
  { pathname: '/color', title: '色一色' },
  { pathname: '/kaleidoscope', title: '万花筒' },
]

export const menuList: (PathItem | 'divider')[] = [
  {
    pathname: '/blog/3EpPJTM2LwB_',
    title: '关于',
  },
  {
    pathname: '/links',
    title: '友链',
  },
  'divider',
  ...toolList,
]
