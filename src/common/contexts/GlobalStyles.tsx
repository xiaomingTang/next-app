/**
 * 部分样式，为了强制使用 style-loader，所以放在这里
 */
export function GlobalStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
* {
  box-sizing: border-box;
}

:root {
  --vh: 1vh;
  font-size: 16px;
  line-height: 1.5;
}

html, body {
  margin: 0;
  padding: 0;
  color: #1a2027;
  background-color: #eee;
  font-family: -apple-system, system-ui, 'Segoe UI', Roboto, Ubuntu, Cantarell,
    'Noto Sans', sans-serif, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', Arial;
}

[data-mui-color-scheme='dark'] body {
  color: #eee;
  background-color: #4d4d4d;
}
`,
      }}
    />
  )
}
