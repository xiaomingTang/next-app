import Boom from '@hapi/boom'
import httpStatus from 'http-status'

export type Func<Args extends unknown[], Ret> = (...args: Args) => Ret

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

export function toPlainError(err: Error): PlainError {
  if (Boom.isBoom(err)) {
    const { payload } = err.output
    return {
      code: payload.statusCode,
      message: `[${payload.error}]: ${payload.message}`,
    }
  }
  return {
    code: err.code ?? httpStatus.INTERNAL_SERVER_ERROR,
    message:
      err.message || httpStatus[`${httpStatus.INTERNAL_SERVER_ERROR}_MESSAGE`],
  }
}

export function isPlainError(err: unknown): err is PlainError {
  return !!err && !!(err as PlainError).code && !!(err as PlainError).message
}

export function toError(err: unknown): Error {
  if (err instanceof Error) {
    return err
  }
  const message =
    (err as PlainError)?.message ??
    (err as PlainError)?.toString() ??
    'unknown error'
  const retError = new Error(message)
  retError.code = (err as PlainError)?.code ?? httpStatus.INTERNAL_SERVER_ERROR
  return retError
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
        error: toPlainError(toError(error)),
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
