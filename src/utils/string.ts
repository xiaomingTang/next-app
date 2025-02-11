export function validateFileName(name: string) {
  if (!name) {
    throw new Error('文件名不能为空')
  }
  if (name.length > 200) {
    throw new Error('文件名过长')
  }
  // 不能以空格开头或结尾
  if (name.startsWith(' ') || name.endsWith(' ')) {
    throw new Error('文件名不能以空格开头或结尾')
  }
  // 不能包含特殊字符
  if (/[<>/\\|:*?\t\n\r\f]/.test(name)) {
    throw new Error('无效文件名')
  }
  // 文件名不能仅包含 . 以及空格
  if (/^[\s.]+$/.test(name)) {
    throw new Error('无效文件名')
  }
  // 文件名不能以 . 结尾
  if (name.endsWith('.')) {
    throw new Error('无效文件名')
  }
  return name
}

export function formatText(text: string, headingLen: number, tailLen: number) {
  if (text.length <= headingLen + tailLen) {
    return text
  }
  return `${text.slice(0, headingLen)}...${text.slice(-tailLen)}`
}
