'use client'

import { seo } from '@/utils/seo'

import { useEffect } from 'react'

interface FESEOProps {
  title?: string
  description?: string
  keywords?: string
  asFull?: boolean
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
  asFull = false,
}: FESEOProps) {
  useEffect(() => {
    const descriptionElem = document.querySelector<HTMLElement>(
      `meta[name="description"]`
    )
    const keywordsElem = document.querySelector<HTMLElement>(
      `meta[name="keywords"]`
    )
    if (title) {
      document.title = seo.title(title, asFull)
    }
    if (descriptionElem && description) {
      descriptionElem.innerText = seo.description(description, asFull)
    }
    if (keywordsElem && keywords) {
      keywordsElem.innerText = seo.keywords(keywords, asFull)
    }
  }, [asFull, description, keywords, title])

  return <></>
}
