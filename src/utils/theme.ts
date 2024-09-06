/**
 * @deprecated
 * light 直接作为默认样式, 无需特别声明;
 * 不应直接声明, 不信就试试把 header AppBar 的背景色放到 light 内试试,
 * 刷新页面会闪一下绿色 (看不清就直接刷新页面, F12 看传输过来的文档的 preview)
 * css-in-js 属性生成函数
 * @param cssSelector 默认为 '&' (即代表自身)
 * @usage
 * ``` tsx
 * function Comp() {
 *   return <TextField
 *     sx={{
 *       [light('& label.Mui-focused')]: {
 *         color: '#A0AAB4',
 *       },
 *       [dark('& .MuiInput-underline:after')]: {
 *         borderBottomColor: '#B2BAC2',
 *       },
 *     }}
 *   />
 * }
 * ```
 */
export function light(cssSelector = '&') {
  return `[data-light] ${cssSelector}`
}

/**
 * css-in-js 属性生成函数
 * @param cssSelector 默认为 '&' (即代表自身)
 * @usage
 * ``` tsx
 * function Comp() {
 *   return <TextField
 *     sx={{
 *       [light('& label.Mui-focused')]: {
 *         color: '#A0AAB4',
 *       },
 *       [dark('& .MuiInput-underline:after')]: {
 *         borderBottomColor: '#B2BAC2',
 *       },
 *     }}
 *   />
 * }
 * ```
 */
export function dark(cssSelector = '&') {
  return `[data-dark] ${cssSelector}`
}
