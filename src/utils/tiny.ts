export function obj<K extends Record<number | string | symbol, unknown>>(
  rec: K | false | null | undefined | '' | 0
): Partial<K> {
  return rec || ({} as Partial<K>)
}
