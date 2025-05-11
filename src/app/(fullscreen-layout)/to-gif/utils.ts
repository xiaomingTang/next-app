export function getImageExtension(file: File) {
  const ext = file.name.split('.').pop()
  switch (file.type) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/gif':
      return 'gif'
    case 'image/webp':
      return 'webp'
    case 'image/bmp':
      return 'bmp'
    case 'image/tiff':
    case 'image/tif':
      return 'tif'
    case 'image/svg+xml':
    case 'image/svg':
      return 'svg'
    case 'image/heic':
    case 'image/heif':
      return 'heic'
    case 'image/avif':
      return 'avif'
    case 'image/ico':
      return 'ico'
    default:
      break
  }
  if (!ext) {
    return 'jpg'
  }
  if (ext === 'jpeg') {
    return 'jpg'
  }
  return ext
}
