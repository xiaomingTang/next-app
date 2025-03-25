import { CLOCK_CONFIGS, CLOCK_CONFIG_MAP } from '@D/clock/constants'
import { Hands } from '@D/clock/components/Hands'
import { Clock } from '@D/clock/components/Clock'

import { notFound } from 'next/navigation'

type ClockTheme = keyof typeof CLOCK_CONFIG_MAP

interface Params {
  theme: ClockTheme
}

interface Props {
  params: Promise<Params>
}

export const dynamicParams = false

export async function generateStaticParams(): Promise<Params[]> {
  return CLOCK_CONFIGS.map((config) => ({
    theme: config.id,
  }))
}

export default async function Index(props: Props) {
  const { theme } = await props.params

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
