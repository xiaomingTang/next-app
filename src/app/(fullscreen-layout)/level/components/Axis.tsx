'use client'

import { range } from 'lodash-es'
import { useMeasure } from 'react-use'

const step1List = range(1, 180, 1)
const step10List = range(10, 180, 10)

export function LevelAxis() {
  const [ref, size] = useMeasure<SVGElement>()
  const svgWidth = size.width || 1920
  const svgHeight = size.height || 1080
  const centerX = svgWidth / 2
  const centerY = svgHeight / 2
  const dx = svgWidth / 180
  const dy = svgHeight / 180

  // y 轴上的刻度(水平线)
  const horizontalLines = step1List.map((index) => {
    let dt = 4
    if (index % 5 === 0) {
      dt = 8
    }
    if (index % 10 === 0) {
      dt = 12
    }
    return (
      <line
        key={`h-${index}`}
        x1={centerX - dt}
        y1={index * dy}
        x2={centerX + dt}
        y2={index * dy}
      />
    )
  })

  // x 轴上的刻度(竖直线)
  const verticalLines = step1List.map((index) => {
    let dt = 4
    if (index % 5 === 0) {
      dt = 8
    }
    if (index % 10 === 0) {
      dt = 12
    }
    return (
      <line
        key={`v-${index}`}
        x1={index * dx}
        y1={centerY - dt}
        x2={index * dx}
        y2={centerY + dt}
      />
    )
  })

  // 水平网格
  const horizontalGridLines = step10List.map((index) => (
    <line
      key={`h-${index}`}
      x1={0}
      y1={index * dy}
      x2={svgWidth}
      y2={index * dy}
    />
  ))

  // 竖直网格
  const verticalGridLines = step10List.map((index) => (
    <line
      key={`v-${index}`}
      x1={index * dx}
      y1={0}
      x2={index * dx}
      y2={svgHeight}
    />
  ))

  return (
    <svg
      ref={(elem) => {
        if (elem) {
          ref(elem)
        }
      }}
      xmlns='http://www.w3.org/2000/svg'
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      preserveAspectRatio='none'
      style={{ position: 'absolute', width: '100%', height: '100%' }}
    >
      <g style={{ stroke: 'black', strokeWidth: '1px' }}>
        {/* x 轴 */}
        <path d={`M0 ${centerY} L${svgWidth} ${centerY}`} />

        {/* y 轴 */}
        <path d={`M${centerX} 0 L${centerX} ${svgHeight}`} />
      </g>

      <g style={{ stroke: 'black', strokeWidth: '0.5px' }}>
        {/* y 轴上的刻度(水平线) */}
        {horizontalLines}

        {/* 轴上的刻度(竖直线) */}
        {verticalLines}
      </g>

      <g style={{ stroke: 'rgba(0,0,0,0.3)', strokeWidth: '0.5px' }}>
        {/* 水平网格 */}
        {horizontalGridLines}
        {/* 竖直网格 */}
        {verticalGridLines}
      </g>
    </svg>
  )
}
