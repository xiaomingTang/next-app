import { Box } from '@mui/material'

export function Hand({
  center,
  width,
  height,
  degree,
  color,
}: {
  center: [number, number]
  width: number
  height: number
  degree: number
  color: string
}) {
  const [x, y] = center
  return (
    <Box
      component='rect'
      sx={{
        width,
        height,
        rx: 9999,
        ry: 9999,
        fill: color,
        transformOrigin: `${x}px ${y}px`,
        transform: `rotate(${degree}deg) translate(${x}px,${y - height / 2}px)`,
      }}
    />
  )
}
