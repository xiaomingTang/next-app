'use client'

// https://github.com/emotion-js/emotion/issues/2928#issuecomment-1319747902
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { useServerInsertedHTML } from 'next/navigation'
import { useState } from 'react'

export default function EmotionSSRRegistry({
  children,
}: {
  children: JSX.Element
}) {
  const [{ cache, flush }] = useState(() => {
    const tmpCache = createCache({ key: 'emo' })
    tmpCache.compat = true
    const prevInsert = tmpCache.insert
    let inserted: string[] = []
    tmpCache.insert = (...args) => {
      const serialized = args[1]
      if (tmpCache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name)
      }
      return prevInsert(...args)
    }
    const tmpFlush = () => {
      const prevInserted = inserted
      inserted = []
      return prevInserted
    }
    return { cache: tmpCache, flush: tmpFlush }
  })

  useServerInsertedHTML(() => {
    const names = flush()
    if (names.length === 0) return null
    let styles = ''
    Object.values(names).forEach((name) => {
      styles += cache.inserted[name]
    })
    return (
      <style
        key='emotion'
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    )
  })

  return <CacheProvider value={cache}>{children}</CacheProvider>
}
