declare module '*.sql' {
  const content: string
  export default content
}

declare module '*.txt' {
  const content: string
  export default content
}

declare module '*.svg?icon' {
  const content: React.ForwardRefExoticComponent<
    React.SVGAttributes<SVGElement> & React.RefAttributes<SVGElement>
  >

  export default content
}

declare module '*.wasm' {
  const content: string
  export default content
}
