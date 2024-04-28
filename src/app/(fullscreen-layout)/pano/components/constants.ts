import type { Pano } from './type'

export const HOTSPOT_DEPTH = 0.5

export const panoConfig: Pano.Config = {
  positions: [
    {
      name: '前排',
      view: {
        h: 272,
        v: 104,
        fov: 75,
      },
      hotspots: [
        {
          name: '后排',
          type: 'POSITION',
          target: '后排',
          h: 131,
          v: 109,
        },
        {
          name: '内饰',
          type: 'DECORATION',
          target: '内饰',
          h: 88.6,
          v: 92.7,
        },
        {
          name: '脚垫',
          type: 'DECORATION',
          target: '脚垫',
          h: 248.9,
          v: 161.3,
        },
      ],
      base: {
        name: '底图',
        thumb: '/static/pano/car-1/front/base-thumb.jpg',
        standard: '/static/pano/car-1/front/base-4k.jpg',
      },
      decorations: [
        {
          name: '内饰',
          patterns: [
            {
              name: '黑色',
              color: '#39393B',
              thumb: '/static/pano/car-1/front/内饰/黑色-39393B-thumb.png',
              standard: '/static/pano/car-1/front/内饰/黑色-39393B-4k.png',
            },
            {
              name: '干邑色',
              color: '#976E59',
              thumb: '/static/pano/car-1/front/内饰/干邑色-976E59-thumb.png',
              standard: '/static/pano/car-1/front/内饰/干邑色-976E59-4k.png',
            },
          ],
        },
        {
          name: '脚垫',
          patterns: [
            {
              name: '活力橙',
              color: '#5B3018',
              thumb: '/static/pano/car-1/front/脚垫/活力橙-5B3018-thumb.png',
              standard: '/static/pano/car-1/front/脚垫/活力橙-5B3018-4k.png',
            },
            {
              name: '热情红',
              color: '#40111D',
              thumb: '/static/pano/car-1/front/脚垫/热情红-40111D-thumb.png',
              standard: '/static/pano/car-1/front/脚垫/热情红-40111D-4k.png',
            },
          ],
        },
      ],
    },
    {
      name: '后排',
      view: {
        h: 92,
        v: 109,
        fov: 75,
      },
      hotspots: [
        {
          name: '前排',
          type: 'POSITION',
          target: '前排',
          h: 296,
          v: 106,
        },
        {
          name: '内饰',
          type: 'DECORATION',
          target: '内饰',
          h: 88.3,
          v: 120.4,
        },
        {
          name: '脚垫',
          type: 'DECORATION',
          target: '脚垫',
          h: 251.4,
          v: 126.3,
        },
      ],
      base: {
        name: '底图',
        thumb: '/static/pano/car-1/back/base-thumb.jpg',
        standard: '/static/pano/car-1/back/base-4k.jpg',
      },
      decorations: [
        {
          name: '内饰',
          patterns: [
            {
              name: '黑色',
              color: '#39393B',
              thumb: '/static/pano/car-1/back/内饰/黑色-39393B-thumb.png',
              standard: '/static/pano/car-1/back/内饰/黑色-39393B-4k.png',
            },
            {
              name: '干邑色',
              color: '#976E59',
              thumb: '/static/pano/car-1/back/内饰/干邑色-976E59-thumb.png',
              standard: '/static/pano/car-1/back/内饰/干邑色-976E59-4k.png',
            },
          ],
        },
        {
          name: '脚垫',
          patterns: [
            {
              name: '活力橙',
              color: '#5B3018',
              thumb: '/static/pano/car-1/back/脚垫/活力橙-5B3018-thumb.png',
              standard: '/static/pano/car-1/back/脚垫/活力橙-5B3018-4k.png',
            },
            {
              name: '热情红',
              color: '#40111D',
              thumb: '/static/pano/car-1/back/脚垫/热情红-40111D-thumb.png',
              standard: '/static/pano/car-1/back/脚垫/热情红-40111D-4k.png',
            },
          ],
        },
      ],
    },
  ],
}
