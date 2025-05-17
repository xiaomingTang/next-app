import GraphemeSplitter from 'grapheme-splitter'

const splitter = new GraphemeSplitter()
export const splitGraphemes = splitter.splitGraphemes.bind(splitter)

export function sliceString(str: string, start = 0, end?: number): string {
  const graphemes = splitGraphemes(str)
  if (end === undefined) {
    end = graphemes.length
  }
  return graphemes.slice(start, end).join('')
}

export function completion(input: string, target: string[]): string[] {
  // e.g. input = 'a', target = ['abcde', 'abcf', 'abce', 'aabc']
  const inputGraphemes = splitGraphemes(input)
  const inputLength = inputGraphemes.length

  // filtered = ['abcde', 'abcf', 'abce']
  const filtered = target.filter(
    (str) => sliceString(str, 0, inputLength) === input && str !== input
  )

  if (filtered.length === 0) {
    return []
  }
  if (filtered.length === 1) {
    return [sliceString(filtered[0], inputLength)]
  }

  // filteredGraphemes = [['b', 'c', 'd', 'e'], ['b', 'c', 'f'], ['b', 'c', 'e']]
  const filteredGraphemes = filtered.map((str) =>
    splitGraphemes(str).slice(inputLength)
  )

  // to be ['b', 'c']
  const prefix: string[] = []

  const minLength = Math.min(...filteredGraphemes.map((arr) => arr.length))
  for (let i = 0; i < minLength; i += 1) {
    // currentGrapheme = 'c'
    const currentGrapheme = filteredGraphemes[0][i]
    if (filteredGraphemes.every((arr) => arr[i] === currentGrapheme)) {
      prefix.push(currentGrapheme)
    } else {
      break
    }
  }

  return prefix
}
