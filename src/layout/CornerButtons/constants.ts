interface PathItem {
  pathname: string
  title: string
}

export const cardList: PathItem[] = [
  { pathname: '/cards/fruits', title: '水果' },
  { pathname: '/cards/foods', title: '肉和菜' },
  { pathname: '/cards/colors', title: '颜色' },
  { pathname: '/cards/area', title: '国家和地区' },
]

export const toolList: PathItem[] = [
  { pathname: '/wallpaper', title: '壁纸' },
  { pathname: '/gotcha', title: '试一试' },
  { pathname: '/color', title: '色一色' },
]

export const menuList: (PathItem | 'divider')[] = [
  {
    pathname: '/blog/3EpPJTM2LwB_',
    title: '关于',
  },
  'divider',
  ...toolList,
  'divider',
  ...cardList,
]
