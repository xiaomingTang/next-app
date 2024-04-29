import type { Pano } from './type'

export const HOTSPOT_DEPTH = 0.5

export const panoConfig: Pano.Config = {
  positions: [
    {
      name: '前排',
      view: {
        h: 269.9,
        v: 100.7,
        fov: 100.1,
      },
      hotspots: [
        {
          name: '后排',
          type: 'POSITION',
          target: '后排',
          h: 136.4,
          v: 110.3,
        },
        {
          name: '内饰',
          type: 'DECORATION',
          target: '内饰',
          h: 87.6,
          v: 91.3,
        },
        {
          name: '脚垫',
          type: 'DECORATION',
          target: '脚垫',
          h: 251.8,
          v: 140.4,
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
        h: 89.7,
        v: 103.3,
        fov: 91.3,
      },
      hotspots: [
        {
          name: '前排',
          type: 'POSITION',
          target: '前排',
          h: 292.1,
          v: 101,
        },
        {
          name: '内饰',
          type: 'DECORATION',
          target: '内饰',
          h: 87.7,
          v: 115.9,
        },
        {
          name: '脚垫',
          type: 'DECORATION',
          target: '脚垫',
          h: 177.2,
          v: 158,
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
