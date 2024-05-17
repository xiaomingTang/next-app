import Boom from '@hapi/boom'
import { fromZodError } from 'zod-validation-error'

import type { ZodType, z } from 'zod'
import type { ZodError } from 'zod-validation-error'

/**
 * generate function with pre validation of zod type
 */
export function zf<T extends ZodType, Ret>(
  zodType: T,
  callback: (props: z.infer<T>) => Promise<Ret>
): typeof callback {
  return (props) => {
    let parsedProps: T
    try {
      parsedProps = zodType.parse(props)
    } catch (error) {
      const validationError = fromZodError(error as ZodError)
      throw Boom.badRequest(validationError.toString())
    }
    return callback(parsedProps)
  }
}
