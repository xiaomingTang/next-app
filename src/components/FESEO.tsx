'use client'

import { useEffect } from 'react'

interface FESEOProps {
  title?: string
  description?: string
  keywords?: string
}

/**
 * fix: [前端路由时, 页面 title 不会变化](https://github.com/vercel/next.js/issues/42784);
 *
 * [这儿](https://github.com/vercel/next.js/issues/42414#issuecomment-1319872733)说解决了, 解决个毛线;
 */
export function FESEO({
  title = '',
  description = '',
  keywords = '',
}: FESEOProps) {
  useEffect(() => {
    const descriptionElem = document.querySelector<HTMLElement>(
      `meta[name="description"]`
    )
    const keywordsElem = document.querySelector<HTMLElement>(
      `meta[name="keywords"]`
    )
    if (title) {
      document.title = title
    }
    if (descriptionElem && description) {
      descriptionElem.innerText = description
    }
    if (keywordsElem && keywords) {
      keywordsElem.innerText = keywords
    }
  }, [description, keywords, title])

  return <></>
}
