export function rand<T>(arr: ArrayLike<T>): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * 越靠前的数据概率越高，概率线性下降
 */
export function weightedRandom<T>(arr: ArrayLike<T>): T {
  const totalWeight = (arr.length * (arr.length + 1)) / 2
  const randomValue = Math.random() * totalWeight

  let cumulativeWeight = 0
  for (let i = 0; i < arr.length; i += 1) {
    cumulativeWeight += arr.length - i
    if (randomValue <= cumulativeWeight) {
      return arr[i]
    }
  }

  return arr[0]
}

export function restrictPick<S, T extends S>(
  value: S,
  array: T[]
): T | undefined
export function restrictPick<S, T extends S>(
  value: S,
  array: T[],
  defaultValue: T
): T
export function restrictPick<S, T extends S>(
  value: S,
  array: T[],
  defaultValue?: T
): T | undefined {
  if (array.includes(value as T)) {
    return value as T
  }
  return defaultValue
}

type IdGenerator<T> = (v: T) => string

function defaultGenerateId(v: unknown): string {
  return Object.prototype.toString.call(v)
}

export function dedup<T>(
  list: T[],
  generateId: IdGenerator<T> = defaultGenerateId
) {
  const map: Record<string, true> = {}
  return list.filter((item) => {
    const id = generateId(item)
    if (id in map) {
      return false
    }
    map[id] = true
    return true
  })
}
