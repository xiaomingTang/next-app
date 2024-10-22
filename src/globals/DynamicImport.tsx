'use client'

import { sleepMs } from '@/utils/time'
import { withStatic } from '@/utils/withStatic'

import React, { useMemo } from 'react'
import { create } from 'zustand'

interface DynamicImport {
  id: string
  element?: JSX.Element
}

const useRawDynamicImport = create<{
  list: DynamicImport[]
}>(() => ({ list: [] }))

export const useDynamicImport = withStatic(useRawDynamicImport, {
  async add(id: string, importer: () => Promise<JSX.Element>) {
    useRawDynamicImport.setState(({ list }) => {
      if (list.find((item) => item?.id === id)) {
        return {
          list,
        }
      }
      return { list: [...list, { id }] }
    })
    const element = await importer()
    useRawDynamicImport.setState(({ list }) => ({
      list: list.map((item) => {
        if (item.id !== id) {
          return item
        }
        return { ...item, element }
      }),
    }))
    await sleepMs(0)
  },
  remove: (id: string) => {
    useRawDynamicImport.setState(({ list }) => ({
      list: list.filter((item) => item.id !== id),
    }))
  },
})

export function DynamicImportSeeds() {
  const list = useDynamicImport((state) => state.list)

  return useMemo(
    () =>
      list.map(({ id, element }) => (
        <React.Fragment key={`GlobalDynamicImport-${id}`}>
          {element}
        </React.Fragment>
      )),
    [list]
  )
}
