import { CLOCK_CONFIGS, CLOCK_CONFIG_MAP } from '@D/clock/constants'
import { Hands } from '@D/clock/components/Hands'
import { Clock } from '@D/clock/components/Clock'

import { notFound } from 'next/navigation'

type ClockTheme = keyof typeof CLOCK_CONFIG_MAP

interface Props {
  params: { theme: ClockTheme }
}

export const dynamicParams = false

export async function generateStaticParams(): Promise<Props['params'][]> {
  return CLOCK_CONFIGS.map((config) => ({
    theme: config.id,
  }))
}

export default function Index(props: Props) {
  const { theme } = props.params

  const config = CLOCK_CONFIG_MAP[theme]

  // 其实上面有了 dynamicParams = false 可以不用这个判断
  // 但是反正加了又没有坏处，保险一点
  if (!config) {
    notFound()
  }

  return (
    <Clock
      sx={{
        height: '100vh',
      }}
    >
      <config.Dial width='100%' height='100%' />
      <Hands config={config} />
    </Clock>
  )
}
