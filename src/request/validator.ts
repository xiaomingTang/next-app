import { validate } from 'jsonschema'
import Boom from '@hapi/boom'

import type { Options, Schema, ValidationError } from 'jsonschema'
import type { Static, TSchema } from '@sinclair/typebox'

interface ValidatorResultError extends Error {
  name: 'Validation Error'
  instance: Record<string, unknown>
  schema: Schema
  options: Options
  errors: ValidationError[]
}

function formatValidationError(error: ValidatorResultError) {
  return error.errors.map((err) => err.toString()).join('; ')
}

export function validateRequest<T extends TSchema>(
  dto: T,
  data: unknown
): Static<T> {
  try {
    validate(data, dto, {
      throwAll: true,
    })
    return data as Static<T>
  } catch (error) {
    throw Boom.badRequest(formatValidationError(error as ValidatorResultError))
  }
}
