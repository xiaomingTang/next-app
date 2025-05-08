import type { asmGoAdd } from './test/main.d.ts'

declare global {
  interface Window {
    asmGoAdd: asmGoAdd
  }

  class Go {
    importObject: WebAssembly.Imports
    run(instance: WebAssembly.Instance): Promise<void>
  }
}

export {}
