import Boom from '@hapi/boom'
import opentype from 'opentype.js'
import { readFile } from 'fs-extra'

async function extractGlyphs(fontName: string, textToExtract: string) {
  // 读取字体文件
  const { buffer: fontBuffer } = await readFile(
    `./public/static/fonts/${fontName}.ttf`
  )

  const font = opentype.parse(fontBuffer)

  // 获取特定文本的字形
  const extractedGlyphs = Array.from(new Set(textToExtract.split(''))).map(
    (char) => font.charToGlyph(char)
  )

  // 创建一个新的字体对象
  const subsetFont = new opentype.Font({
    familyName: fontName,
    styleName: 'Subset',
    unitsPerEm: font.unitsPerEm,
    ascender: font.ascender,
    descender: font.descender,
    glyphs: extractedGlyphs,
  })

  // 将生成的字体数据转换为 ArrayBuffer
  return subsetFont.toArrayBuffer()
}
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fontName = (searchParams.get('font') ?? '').replace(/[/\\]/g, '')
  const text = searchParams.get('text')
  if (!fontName || !text) {
    throw Boom.badRequest('Params "font" and "text" is required')
  }
  const fontBuffers = await extractGlyphs(fontName, text)
  return new Response(fontBuffers, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000',
    },
  })
}
