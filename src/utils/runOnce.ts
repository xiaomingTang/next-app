export function geneRunOnly(n: number) {
  let curTimes = 0
  return function runOnly(cb: () => unknown) {
    if (curTimes < n) {
      curTimes += 1
      cb()
    }
  }
}
