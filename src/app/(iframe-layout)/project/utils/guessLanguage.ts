const fallbackLang = 'plaintext'

export function guessLanguage(name?: string): string {
  const ext = name?.split('.').pop()
  if (!ext) {
    return fallbackLang
  }
  switch (ext) {
    case 'js':
      return 'javascript'
    case 'jsx':
    case 'ts':
    case 'tsx':
      return 'typescript'
    case 'json':
    case 'jsonc':
      return 'json'
    case 'html':
    case 'htm':
      return 'html'
    case 'css':
      return 'css'
    case 'less':
      return 'less'
    case 'scss':
    case 'sass':
      return 'scss'
    case 'md':
    case 'mdx':
      return 'markdown'
    case 'py':
      return 'python'
  }
  return fallbackLang
}
