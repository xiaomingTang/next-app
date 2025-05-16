export const XT_FILE_PREFIX = 'sh_file://'
export const XT_DIR_PREFIX = 'sh_dir://'
export const XT_CMD_PREFIX = 'sh_cmd://'

export const linkAddon = {
  link(text: string, url = text) {
    return `\x1b]8;;${url}\x07${text}\x1b]8;;\x07`
  },
  file(text: string, url = text) {
    return linkAddon.link(text, XT_FILE_PREFIX + url)
  },
  dir(text: string, url = text) {
    return linkAddon.link(text, XT_DIR_PREFIX + url)
  },
  cmd(text: string, url = text) {
    return linkAddon.link(text, XT_CMD_PREFIX + url)
  },
}
