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
export function light(cssSelector = '&') {
  return `[data-mui-color-scheme="light"] ${cssSelector}`
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
  return `[data-mui-color-scheme="dark"] ${cssSelector}`
}
