/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod'

export function optionalString(s: z.ZodString) {
  return z.union([z.string().max(0), s]).optional()
}

type KeyOfNullableString<Obj extends Record<string, any>> = {
  [K in keyof Obj]: string | undefined extends Obj[K] ? K : never
}[keyof Obj]

export function emptyToUndefined<Obj extends Record<string, any>>(
  obj: Obj,
  keys: KeyOfNullableString<Obj>[]
) {
  const result = {
    ...obj,
  }
  keys.forEach((k) => {
    if (!result[k]) {
      delete result[k]
    }
  })
  return result
}
