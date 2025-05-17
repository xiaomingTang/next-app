import { resolveCDN } from '@/utils/url'

function font(p: string) {
  return resolveCDN(`/public/static/fonts/${p}`)
}

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
  --custom-bg: #eeeeee;
  --custom-fg: #1a2027;
}

:root[data-dark] {
  --custom-fg: #bdbdbd;
  --custom-bg: #29323d;
}

@font-face {
  font-family: SourceCodePro;
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('${font('SourceCodePro/SourceCodePro-Medium.ttf')}') format('truetype');
}

@font-face {
  font-family: SourceCodePro;
  font-style: italic;
  font-weight: 500;
  font-display: swap;
  src: url('${font('SourceCodePro/SourceCodePro-MediumItalic.ttf')}') format('truetype');
}

@font-face {
  font-family: SourceCodePro;
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('${font('SourceCodePro/SourceCodePro-Bold.ttf')}') format('truetype');
}

@font-face {
  font-family: SourceCodePro;
  font-style: italic;
  font-weight: 700;
  font-display: swap;
  src: url('${font('SourceCodePro/SourceCodePro-BoldItalic.ttf')}') format('truetype');
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
