import { validate } from 'jsonschema'
import Boom from '@hapi/boom'

import type { Options, Schema, ValidationError } from 'jsonschema'
import type { TSchema } from '@sinclair/typebox'

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

export function validateRequest<T extends TSchema>(dto: T, data: unknown) {
  try {
    validate(data, dto, {
      throwAll: true,
    })
  } catch (error) {
    throw Boom.badRequest(formatValidationError(error as ValidatorResultError))
  }
}
