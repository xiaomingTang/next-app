import ansiStyles, { type CSPair } from 'ansi-styles'

export const XT_FILE_PREFIX = 'sh_file://'
export const XT_DIR_PREFIX = 'sh_dir://'
export const XT_CMD_PREFIX = 'sh_cmd://'

function rawLink(text: string, url = text) {
  return `\x1b]8;;${url}\x07${text}\x1b]8;;\x07`
}

export function applyAnsiStyle(text: string, ...styles: CSPair[]) {
  return styles.reduce((acc, style) => {
    const { open, close } = style
    return `${open}${acc}${close}`
  }, text)
}

export const linkAddon = {
  link(text: string, url = text) {
    return applyAnsiStyle(rawLink(text, url), ansiStyles.italic)
  },
  file(text: string, url = text) {
    return applyAnsiStyle(
      rawLink(text, XT_FILE_PREFIX + url),
      ansiStyles.blueBright
    )
  },
  dir(text: string, url = text) {
    return applyAnsiStyle(
      rawLink(text, XT_DIR_PREFIX + url),
      ansiStyles.cyanBright
    )
  },
  cmd(text: string, url = text) {
    return applyAnsiStyle(
      rawLink(text, XT_CMD_PREFIX + url),
      ansiStyles.magentaBright
    )
  },
}
