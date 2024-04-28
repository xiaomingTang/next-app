// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace Pano {
  interface Image {
    name: string
    color?: string
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
    type: 'POSITION' | 'DECORATION'
    target: string
    h: number
    v: number
  }
  interface Decoration {
    name: string
    patterns: Image[]
  }
  interface Position {
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
