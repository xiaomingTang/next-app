'use client'

interface Size {
  width: number
  height: number
}

export async function getImageSize(input: string | Blob): Promise<Size> {
  return new Promise((resolve, reject) => {
    const url = typeof input === 'string' ? input : URL.createObjectURL(input)

    const img = document.createElement('img')

    img.onload = function onload() {
      img.onload = null
      img.onerror = null
      resolve({ width: img.width, height: img.height })
      if (typeof input !== 'string') {
        URL.revokeObjectURL(url)
      }
    }

    img.onerror = function onerror(err) {
      img.onload = null
      img.onerror = null
      reject(err)
      if (typeof input !== 'string') {
        URL.revokeObjectURL(url)
      }
    }

    img.src = url
  })
}
