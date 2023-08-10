export class IndexManager {
  private stack: number[] = []

  get latest() {
    // 是最大值 而非 最后一个元素, 因为 stack 不一定是 有序的
    return Math.max(...this.stack) ?? 0
  }

  push(n = this.latest) {
    this.stack.push(n)
  }

  drop(n = this.latest) {
    this.stack = this.stack.filter((k) => k !== n)
  }

  has(n: number) {
    return this.stack.includes(n)
  }
}
