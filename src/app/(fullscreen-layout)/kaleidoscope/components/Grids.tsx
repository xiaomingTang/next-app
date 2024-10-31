import type { SVGAttributes } from 'react'

interface GridsProps extends SVGAttributes<HTMLOrSVGElement> {
  width: number
  height: number
  gridSize: number
}

export function Grids({ width, height, gridSize, ...svgProps }: GridsProps) {
  /**
   * 线条数，确保奇数个线条，以便中心线条在中心
   */
  const xCount =
    Math.ceil(width / gridSize) % 2
      ? Math.ceil(width / gridSize) + 1
      : Math.ceil(width / gridSize)
  const yCount =
    Math.ceil(height / gridSize) % 2
      ? Math.ceil(height / gridSize) + 1
      : Math.ceil(height / gridSize)
  /**
   * 网格起始坐标
   */
  const x0 = (width - xCount * gridSize) / 2
  const y0 = (height - yCount * gridSize) / 2

  return (
    <svg {...svgProps}>
      {Array.from({ length: xCount }).map((_, i) => (
        <line
          key={i}
          x1={x0 + i * gridSize}
          y1={y0}
          x2={x0 + i * gridSize}
          y2={y0 + yCount * gridSize}
        />
      ))}
      {Array.from({ length: yCount }).map((_, i) => (
        <line
          key={i}
          x1={x0}
          y1={y0 + i * gridSize}
          x2={x0 + xCount * gridSize}
          y2={y0 + i * gridSize}
        />
      ))}
    </svg>
  )
}
