import ansiStyles from 'ansi-styles'

import type { BackgroundColor, ForegroundColor, Modifier } from 'ansi-styles'

export const XT_FILE_PREFIX = 'sh_file://'
export const XT_DIR_PREFIX = 'sh_dir://'
export const XT_CMD_PREFIX = 'sh_cmd://'

type CsPairKey = keyof (Modifier & ForegroundColor & BackgroundColor)

type AnsiMap = Record<CsPairKey, (input: string) => string>

export const ansi = new Proxy<AnsiMap>({} as AnsiMap, {
  get: (_, k) => (input: string) => {
    const csPair = ansiStyles[k as CsPairKey]
    if (!csPair) {
      return input
    }
    return `${csPair.open}${input}${csPair.close}`
  },
})

function rawLink(text: string, url = text) {
  return `\x1b]8;;${url}\x07${text}\x1b]8;;\x07`
}

export const linkAddon = {
  link(text: string, url = text) {
    return ansi.italic(rawLink(text, url))
  },
  file(text: string, url = text) {
    return ansi.blueBright(rawLink(text, XT_FILE_PREFIX + url))
  },
  dir(text: string, url = text) {
    return ansi.cyanBright(rawLink(text, XT_DIR_PREFIX + url))
  },
  cmd(text: string, url = text) {
    return ansi.magentaBright(rawLink(text, XT_CMD_PREFIX + url))
  },
}
