interface PathItem {
  pathname: string
  title: string
}

export const toolList: PathItem[] = [
  { pathname: '/clock', title: '时钟橱窗' },
  { pathname: '/level', title: '在线水平仪' },
  { pathname: '/cid', title: '随机生成身份证' },
  { pathname: '/wallpaper', title: '壁纸' },
  { pathname: '/color', title: '色一色' },
  { pathname: '/gotcha', title: '试一试' },
]

export const menuList: (PathItem | 'divider')[] = [
  {
    pathname: '/blog/3EpPJTM2LwB_',
    title: '关于',
  },
  'divider',
  ...toolList,
]
