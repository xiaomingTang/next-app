'use client'

import { useEffect } from 'react'

interface CustomVariables {
  mp3s: (typeof globalThis)['mp3s']
}

export function InjectGlobalVariables({
  variables,
  children,
}: {
  variables: CustomVariables
  children: React.ReactNode | React.ReactNode[]
}) {
  Object.keys(variables).forEach((k) => {
    const tk = k as keyof CustomVariables
    if (typeof global !== 'undefined') {
      global[tk] = variables[tk]
    }
    if (typeof window !== 'undefined') {
      window[tk] = variables[tk]
    }
  })

  useEffect(() => {
    Object.keys(variables).forEach((k) => {
      const tk = k as keyof CustomVariables
      if (typeof global !== 'undefined') {
        global[tk] = variables[tk]
      }
      if (typeof window !== 'undefined') {
        window[tk] = variables[tk]
      }
    })
  }, [variables])

  return <>{children}</>
}
