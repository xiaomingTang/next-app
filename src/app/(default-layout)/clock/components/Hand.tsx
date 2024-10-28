import { remainder } from '@/utils/math'

import { Box } from '@mui/material'

export function Hand({
  center,
  width,
  height,
  degree: inputDegree,
  color,
}: {
  center: [number, number]
  width: number
  height: number
  degree: number
  color: string
}) {
  const [x, y] = center
  const degree = remainder(inputDegree, 360)
  return (
    <Box
      component='rect'
      sx={{
        width,
        height,
        rx: 9999,
        ry: 9999,
        fill: color,
        transition: degree >= 354 || degree <= 6 ? 'none' : 'transform .25s',
        // easeOutQuart
        transitionTimingFunction: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
        transformOrigin: `${x}px ${y}px`,
      }}
      style={{
        transform: `rotate(${degree}deg) translate(${x}px,${y - height / 2}px)`,
      }}
    />
  )
}
