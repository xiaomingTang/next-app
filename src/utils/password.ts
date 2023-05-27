import { scryptSync } from 'node:crypto'

export function generatePassword(password: string) {
  return scryptSync(password, process.env.PASSWORD_SALT, 64).toString('hex')
}

export function comparePassword(password: string, encrypted: string) {
  return generatePassword(password) === encrypted
}
