export const SilentErrorCode = 10000

export class SilentError extends Error {
  constructor(msg = 'silent error') {
    super(msg)
    this.code = SilentErrorCode
  }
}
