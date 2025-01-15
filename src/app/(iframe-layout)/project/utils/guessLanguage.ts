const fallbackLang = 'plaintext'

export function guessLanguage(name?: string): string {
  const ext = name?.split('.').pop()
  if (!ext) {
    return fallbackLang
  }
  switch (ext) {
    case 'js':
    case 'jsx':
      return 'javascript'
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
    case 'less':
    case 'scss':
    case 'sass':
      return 'css'
    case 'md':
    case 'mdx':
      return 'markdown'
  }
  return fallbackLang
}
