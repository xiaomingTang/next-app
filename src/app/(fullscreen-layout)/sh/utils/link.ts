export function xtLink(text: string, url = text): string {
  return `\x1b]8;;${url}\x07${text}\x1b]8;;\x07`
}
