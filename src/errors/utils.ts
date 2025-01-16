import Boom from '@hapi/boom'
import { revalidateTag, revalidatePath } from 'next/cache'

import type { Func } from '@/utils/function'

export interface PlainError {
  code: number
  message: string
}

export type ServerResponse<T> =
  | {
      data: T
      error: undefined
    }
  | {
      data: undefined
      error: PlainError
    }

export function toError(err: unknown): Error {
  if (err instanceof Error) {
    return err
  }
  const message =
    (err as PlainError)?.message ??
    (err as PromiseRejectedResult)?.reason ??
    (err as PlainError)?.toString() ??
    '未知错误'
  const retError = new Error(message)
  retError.code = (err as PlainError)?.code ?? 500
  return retError
}

export function toPlainError(inputError: unknown): PlainError {
  const err = toError(inputError)
  if (Boom.isBoom(err)) {
    const { payload } = err.output
    return {
      code: payload.statusCode,
      message: `[${payload.error}]: ${payload.message}`,
    }
  }
  return {
    code: err.code ?? 500,
    message: err.message || '服务器错误, 请稍后再试',
  }
}

export function filterServerError(err: PlainError): PlainError {
  if (err.code < 500) {
    return err
  }
  console.error(err.message)
  return {
    ...err,
    message: '服务器错误, 请稍后再试',
  }
}

export function pipePromiseAllSettled<T>(
  resList: PromiseSettledResult<T>[]
): PromiseSettledResult<T>[] {
  return resList.map((res) =>
    res.status === 'fulfilled'
      ? res
      : ({
          ...res,
          reason: filterServerError(toPlainError(res.reason)),
        } as PromiseRejectedResult)
  )
}

export function isPlainError(err: unknown): err is PlainError {
  return !!err && !!(err as PlainError).code && !!(err as PlainError).message
}

/**
 * it used to wrap server action
 * ``` typescript
 * export const serverActionXXX = SA.decode(async () => {
 *   // ...
 *   // you can throw meaningful error
 *   throw Boom.forbidden('not permitted')
 *   // or throw error just for interruption
 *   throw new Error('whatever')
 * })
 * ```
 */
function serverActionEncoder<Args extends unknown[], Ret>(
  func: Func<Args, Promise<Ret>>
): Func<Args, Promise<ServerResponse<Ret>>> {
  return async (...args) => {
    try {
      const ret = await func(...args)
      return {
        data: ret,
        error: undefined,
      }
    } catch (error) {
      return {
        data: undefined,
        error: filterServerError(toPlainError(error)),
      }
    }
  }
}

/**
 * it will throw error,
 * you need to catch it yourself
 */
function serverActionDecoder<Ret>(ret: ServerResponse<Ret>): Ret {
  if (ret.error) {
    throw toError(ret.error)
  }
  return ret.data
}

export const SA = {
  encode: serverActionEncoder,
  decode: serverActionDecoder,
}

export type SA_RES<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Func<any[], Promise<ServerResponse<infer R>>> ? R : never

export function withRevalidate<T>({
  tags = [],
  paths = [],
}: {
  tags?: string[]
  paths?: string[]
}) {
  return async function pipeResponse(res: T) {
    try {
      tags.forEach((tag) => {
        revalidateTag(tag)
      })
      paths.forEach((p) => {
        revalidatePath(p)
      })
    } catch (_) {
      // pass
    }
    return res
  }
}
