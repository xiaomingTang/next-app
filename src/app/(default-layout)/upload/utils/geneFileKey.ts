function getBlobName(blob: Blob) {
  return (blob as File).name ?? 'unknown'
}

export function geneFileKey(file: Blob) {
  return `${getBlobName(file)} - ${file.size} - ${file.type} - ${
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
  return `${isImage ? '!' : ''}[${getBlobName(file)}](${url})`
}
