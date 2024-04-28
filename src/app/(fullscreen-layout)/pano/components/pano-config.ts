// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace Pano {
  interface Image {
    name: string
    thumb: string
    standard: string
  }
  interface View {
    /**
     * degree
     */
    h: number
    /**
     * degree
     */
    v: number
    /**
     * degree
     */
    fov: number
  }
  interface Hotspot {
    name: string
    view: View
    type: 'POSITION' | 'DECORATION'
    target: string
  }
  interface Decoration {
    id: string
    name: string
    patterns: Image[]
  }
  interface Position {
    id: string
    name: string
    view: View
    base: Image
    decorations: Decoration[]
    hotspots: Hotspot[]
  }
  interface Config {
    positions: Position[]
  }
}

export const panoConfig: Pano.Config = {
  positions: [
    {
      id: '前排',
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
          view: {
            h: 131,
            v: 109,
            fov: 75,
          },
        },
      ],
      base: {
        name: '底图',
        thumb: '/static/pano/car-1/front/base-thumb.jpg',
        standard: '/static/pano/car-1/front/base-4k.jpg',
      },
      decorations: [
        {
          id: '内饰',
          name: '内饰',
          patterns: [
            {
              name: '黑色',
              thumb: '/static/pano/car-1/front/黑色-39393B-thumb.png',
              standard: '/static/pano/car-1/front/黑色-39393B-4k.png',
            },
          ],
        },
      ],
    },
    {
      id: '后排',
      name: '后排',
      view: { h: 92, v: 109, fov: 75 },
      hotspots: [
        {
          name: '前排',
          type: 'POSITION',
          target: '前排',
          view: {
            h: 296,
            v: 106,
            fov: 75,
          },
        },
      ],
      base: {
        name: '底图',
        thumb: '/static/pano/car-1/back/base-thumb.jpg',
        standard: '/static/pano/car-1/back/base-4k.jpg',
      },
      decorations: [
        {
          id: '内饰',
          name: '内饰',
          patterns: [
            {
              name: '干邑色',
              thumb: '/static/pano/car-1/back/干邑色-976E59-thumb.png',
              standard: '/static/pano/car-1/back/干邑色-976E59-4k.png',
            },
          ],
        },
      ],
    },
  ],
}
