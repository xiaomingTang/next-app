declare module '*.sql' {
  const content: string
  export default content
}

declare module '*.svg?icon' {
  const content: React.ForwardRefExoticComponent<
    React.SVGAttributes<SVGElement> & React.RefAttributes<SVGElement>
  >

  export default content
}
