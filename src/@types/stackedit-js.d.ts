declare module 'stackedit-js' {
  export interface BuiltInEvents {
    fileChange: {
      id: string
      name: string
      content: {
        text: string
        html: string
        properties: {
          extensions: Record<string, { enabled: boolean }>
        }
      }
    }
    close: void
  }

  export interface OpenFileProps {
    name?: string
    content?: {
      text?: string
    }
  }

  interface StackeditOptions {
    url?: string
  }

  export default class Stackedit {
    constructor(option?: StackeditOptions)
    openFile(file?: OpenFileProps, silent?: boolean): void
    close(): void
    on<K extends keyof BuiltInEvents>(
      eventName: K,
      callback: (e: BuiltInEvents[K]) => void
    ): void
    off<K extends keyof BuiltInEvents>(
      eventName: K,
      callback: (e: BuiltInEvents[K]) => void
    ): void
  }
}
