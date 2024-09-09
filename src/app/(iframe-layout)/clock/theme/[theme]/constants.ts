import {
  SvgDial01,
  SvgDial02,
  SvgDial03,
  SvgDial04,
  SvgDial05,
  SvgDial06,
  SvgDial07,
  SvgDial08,
  SvgDial09,
  SvgDial10,
  SvgDial11,
  SvgDial12,
  SvgDial13,
} from '@/svg/dial'

export interface ClockConfig {
  id: string
  title: string
  Dial: typeof SvgDial01
  center: [number, number]
  h: {
    width: number
    height: number
  }
  m: {
    width: number
    height: number
  }
  s: {
    width: number
    height: number
  }
}

export const CLOCK_CONFIG_MAP = {
  t01: {
    id: 't01',
    title: '花草',
    Dial: SvgDial01,
    center: [104, 100],
    h: {
      width: 50,
      height: 6,
    },
    m: {
      width: 65,
      height: 4,
    },
    s: {
      width: 80,
      height: 2,
    },
  },
  t02: {
    id: 't02',
    title: '婚礼-新人-手捧花',
    Dial: SvgDial02,
    center: [94, 100],
    h: {
      width: 20,
      height: 6,
    },
    m: {
      width: 25,
      height: 4,
    },
    s: {
      width: 30,
      height: 2,
    },
  },
  t03: {
    id: 't03',
    title: '乐器',
    Dial: SvgDial03,
    center: [100, 100],
    h: {
      width: 20,
      height: 6,
    },
    m: {
      width: 25,
      height: 4,
    },
    s: {
      width: 30,
      height: 2,
    },
  },
  t04: {
    id: 't04',
    title: '两只猫头鹰站树上',
    Dial: SvgDial04,
    center: [100, 100],
    h: {
      width: 20,
      height: 6,
    },
    m: {
      width: 25,
      height: 4,
    },
    s: {
      width: 30,
      height: 2,
    },
  },
  t05: {
    id: 't05',
    title: '罗马数字',
    Dial: SvgDial05,
    center: [100, 100],
    h: {
      width: 40,
      height: 6,
    },
    m: {
      width: 50,
      height: 4,
    },
    s: {
      width: 60,
      height: 2,
    },
  },
  t06: {
    id: 't06',
    title: '猫-水缸-鱼',
    Dial: SvgDial06,
    center: [97, 101],
    h: {
      width: 15,
      height: 6,
    },
    m: {
      width: 20,
      height: 4,
    },
    s: {
      width: 25,
      height: 2,
    },
  },
  t07: {
    id: 't07',
    title: '猫头鹰',
    Dial: SvgDial07,
    center: [100, 100],
    h: {
      width: 40,
      height: 6,
    },
    m: {
      width: 55,
      height: 4,
    },
    s: {
      width: 70,
      height: 2,
    },
  },
  t08: {
    id: 't08',
    title: '美女-侧脸',
    Dial: SvgDial08,
    center: [100, 100],
    h: {
      width: 50,
      height: 6,
    },
    m: {
      width: 65,
      height: 4,
    },
    s: {
      width: 80,
      height: 2,
    },
  },
  t09: {
    id: 't09',
    title: '闹钟',
    Dial: SvgDial09,
    center: [100, 117],
    h: {
      width: 25,
      height: 6,
    },
    m: {
      width: 35,
      height: 4,
    },
    s: {
      width: 45,
      height: 2,
    },
  },
  t10: {
    id: 't10',
    title: '求婚',
    Dial: SvgDial10,
    center: [102, 94],
    h: {
      width: 15,
      height: 6,
    },
    m: {
      width: 20,
      height: 4,
    },
    s: {
      width: 25,
      height: 2,
    },
  },
  t11: {
    id: 't11',
    title: '三美女剪影',
    Dial: SvgDial11,
    center: [98.5, 105],
    h: {
      width: 15,
      height: 6,
    },
    m: {
      width: 20,
      height: 4,
    },
    s: {
      width: 25,
      height: 2,
    },
  },
  t12: {
    id: 't12',
    title: '万花筒-皇冠',
    Dial: SvgDial12,
    center: [100, 100],
    h: {
      width: 20,
      height: 6,
    },
    m: {
      width: 25,
      height: 4,
    },
    s: {
      width: 30,
      height: 2,
    },
  },
  t13: {
    id: 't13',
    title: '摇滚乐队',
    Dial: SvgDial13,
    center: [99.5, 122.2],
    h: {
      width: 22,
      height: 6,
    },
    m: {
      width: 28,
      height: 4,
    },
    s: {
      width: 34,
      height: 2,
    },
  },
} as const satisfies Record<string, ClockConfig>

export const CLOCK_CONFIGS = [
  CLOCK_CONFIG_MAP.t01,
  CLOCK_CONFIG_MAP.t02,
  CLOCK_CONFIG_MAP.t03,
  CLOCK_CONFIG_MAP.t04,
  CLOCK_CONFIG_MAP.t05,
  CLOCK_CONFIG_MAP.t06,
  CLOCK_CONFIG_MAP.t07,
  CLOCK_CONFIG_MAP.t08,
  CLOCK_CONFIG_MAP.t09,
  CLOCK_CONFIG_MAP.t10,
  CLOCK_CONFIG_MAP.t11,
  CLOCK_CONFIG_MAP.t12,
  CLOCK_CONFIG_MAP.t13,
]

export const DEFAULT_CLOCK_CONFIG = CLOCK_CONFIG_MAP.t13
