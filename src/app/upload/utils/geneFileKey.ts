export function geneFileKey(file: Blob) {
  return `${file.name} - ${file.size} - ${file.type} - ${
    (file as File)?.lastModified ?? ''
  }`
}

export function fileToCopyableMarkdownStr({
  url,
  file,
}: {
  url: string
  file: Blob
}) {
  const isImage = file.type.startsWith('image/')
  return `${isImage ? '!' : ''}[${file.name}](${url})`
}
