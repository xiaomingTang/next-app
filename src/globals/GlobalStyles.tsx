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
  --header-height: 0;
  font-size: 16px;
  line-height: 1.5;
  --custom-bg: #eeeeee;
  --custom-fg: #1a2027;
}

:root[data-dark] {
  --custom-fg: #bdbdbd;
  --custom-bg: #29323d;
}

button,
a,
input,
label {
  touch-action: manipulation;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

html, body {
  margin: 0;
  padding: 0;
  font-weight: 400;
  color: var(--custom-fg);
  background-color: var(--custom-bg);
  font-family: -apple-system,
    system-ui,
    'Segoe UI',
    Roboto,
    Ubuntu,
    Cantarell,
    'Noto Sans',
    sans-serif,
    BlinkMacSystemFont,
    'Helvetica Neue',
    'PingFang SC',
    'Hiragino Sans GB',
    'Microsoft YaHei',
    Arial;
}
`,
      }}
    />
  )
}
