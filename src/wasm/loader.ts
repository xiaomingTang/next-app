let go: Go

export function getGo() {
  if (!go) {
    go = new Go()
  }
  return go
}

export async function importGoWasmStreaming(req: Promise<Response>) {
  return {
    go: getGo(),
    result: await WebAssembly.instantiateStreaming(req, go.importObject),
  }
}
