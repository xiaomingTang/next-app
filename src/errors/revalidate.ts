import { revalidateTag, revalidatePath } from 'next/cache'

export function withRevalidate<T>({
  tags = [],
  paths = [],
}: {
  tags?: string[]
  paths?: string[]
}) {
  return async function pipeResponse(res: T) {
    try {
      tags.forEach((tag) => {
        revalidateTag(tag)
      })
      paths.forEach((p) => {
        revalidatePath(p)
      })
    } catch (_) {
      // pass
    }
    return res
  }
}
