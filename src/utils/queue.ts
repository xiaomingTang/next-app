// weighted-task-queue.ts

type TaskFn = () => Promise<void>

interface QueuedTask {
  id: string
  run: TaskFn
}

interface Channel {
  id: string
  weight: number
  queue: QueuedTask[]
}

export class WeightedTaskQueue<ChannelId extends string = string> {
  private channels: Map<ChannelId, Channel> = new Map()
  private taskMap: Map<string, { task: QueuedTask; channelId: ChannelId }> =
    new Map()
  private maxConcurrency: number
  private activeCount = 0
  private scheduleCursor = 0
  private scheduleOrder: ChannelId[] = []

  constructor(maxConcurrency: number) {
    this.maxConcurrency = maxConcurrency
  }

  registerChannel(id: ChannelId, weight: number) {
    if (this.channels.has(id)) {
      return
    }
    this.channels.set(id, {
      id,
      weight,
      queue: [],
    })
    this.rebuildScheduleOrder()
  }

  enqueue(channelId: ChannelId, taskId: string, taskFn: TaskFn) {
    if (this.taskMap.has(taskId)) {
      throw new Error(`Task ID "${taskId}" already exists`)
    }
    const channel = this.channels.get(channelId)
    if (!channel) {
      throw new Error(`Channel "${channelId}" not found`)
    }

    const task: QueuedTask = {
      id: taskId,
      run: taskFn,
    }

    channel.queue.push(task)
    this.taskMap.set(taskId, { task, channelId })
    this.run()
  }

  cancel(taskId: string): boolean {
    const entry = this.taskMap.get(taskId)
    if (!entry) {
      return false
    }
    const { channelId } = entry
    const channel = this.channels.get(channelId)
    if (!channel) {
      return false
    }

    const index = channel.queue.findIndex((t) => t.id === taskId)
    if (index !== -1) {
      channel.queue.splice(index, 1)
      this.taskMap.delete(taskId)
      return true
    }
    return false
  }

  move(taskId: string, newChannelId: ChannelId): boolean {
    const entry = this.taskMap.get(taskId)
    if (!entry) {
      return false
    }
    const { task, channelId } = entry
    const oldChannel = this.channels.get(channelId)
    const newChannel = this.channels.get(newChannelId)
    if (!oldChannel || !newChannel) {
      return false
    }

    const index = oldChannel.queue.findIndex((t) => t.id === taskId)
    if (index !== -1) {
      oldChannel.queue.splice(index, 1)
      newChannel.queue.push(task)
      this.taskMap.set(taskId, { task, channelId: newChannelId })
      return true
    }
    return false
  }

  listTasks(): {
    id: string
    channelId: ChannelId
  }[] {
    const result: {
      id: string
      channelId: ChannelId
    }[] = []
    for (const [channelId, channel] of this.channels) {
      for (const task of channel.queue) {
        result.push({
          id: task.id,
          channelId,
        })
      }
    }
    return result
  }

  private run() {
    while (this.activeCount < this.maxConcurrency) {
      const task = this.pickNextTask()
      if (!task) {
        break
      }

      this.activeCount += 1
      this.taskMap.delete(task.id)
      task
        .run()
        .catch((err) => console.error(`Task ${task.id} failed:`, err))
        .finally(() => {
          this.activeCount -= 1
          this.run()
        })
    }
  }

  private pickNextTask(): QueuedTask | null {
    if (this.scheduleOrder.length === 0) {
      return null
    }

    const tries = this.scheduleOrder.length
    for (let i = 0; i < tries; i++) {
      const channelId = this.scheduleOrder[this.scheduleCursor]
      this.scheduleCursor =
        (this.scheduleCursor + 1) % this.scheduleOrder.length

      const channel = this.channels.get(channelId)
      if (channel && channel.queue.length > 0) {
        return channel.queue.shift()!
      }
    }
    return null
  }

  private rebuildScheduleOrder() {
    this.scheduleOrder = []
    for (const [id, channel] of this.channels) {
      for (let i = 0; i < channel.weight; i++) {
        this.scheduleOrder.push(id)
      }
    }
  }
}
