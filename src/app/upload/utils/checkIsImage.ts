export function checkIsImage(blob: Blob) {
  return blob.type.startsWith('image/')
}
