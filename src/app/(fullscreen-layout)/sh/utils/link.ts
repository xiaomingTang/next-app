export function xtLink(text: string, url = text): string {
  return `\x1b]8;;${url}\x07${text}\x1b]8;;\x07`
}

export const XT_FILE_PREFIX = 'sh_file://'
export const XT_DIR_PREFIX = 'sh_dir://'

export function xtFile(url: string): string {
  return XT_FILE_PREFIX + url
}

export function xtDir(url: string): string {
  return XT_DIR_PREFIX + url
}
