export function geneFileKey(file: Blob) {
  return `${file.name} - ${file.size} - ${file.type} - ${
    (file as File)?.lastModified ?? ''
  }`
}
