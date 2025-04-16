'use server'

// ✅ 所有书 /b/t/?s=xxx
// ✅ 某个标签内所有书 /b/t/{tagHash}/?s=xxx&qc=xxx
// ✅ 某本书目录页 /b/{book-hash}/?p=1&sz=20
// ✅ 详情页 /b/{book-hash}/{N}/

// TODO: 增删改

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { zf } from '@/request/validator'
import { getSelf } from '@/user/server'
import { ensureUser } from '@/user/validate'

import { z } from 'zod'
import Boom from '@hapi/boom'

import type { BookStatus, User } from '@prisma/client'

const bookSelectWithTags = {
  hash: true,
  name: true,
  author: true,
  nsfw: true,
  description: true,
  cover: true,
  status: true,
  tags: {
    select: {
      hash: true,
      name: true,
    },
  },
  _count: {
    select: {
      chapters: true,
    },
  },
}

async function ensureBookAccessibleToUser(user?: Pick<User, 'role' | 'id'>) {
  const finalUser = user ?? (await getSelf())
  return function ensureBookAccessible<
    T extends {
      status: BookStatus
      nsfw: boolean
    },
  >(book?: T | null) {
    if (!book || book.status === 'DELETED') {
      throw Boom.notFound('图书不存在或已删除')
    }
    if (book.status === 'UNPUBLISHED' || book.nsfw) {
      ensureUser(finalUser, {
        roles: ['ADMIN'],
      })
    }
    return book
  }
}

const getBookDto = z.object({
  hash: z.string(),
})

/**
 * 获取书本基本信息（不包括章节）
 */
export const getBook = SA.encode(
  zf(getBookDto, async (props) => {
    const book = await prisma.book
      .findUnique({
        where: {
          hash: props.hash,
        },
        select: bookSelectWithTags,
      })
      .then(await ensureBookAccessibleToUser())
    return book
  })
)

const getBookChaptersDto = z.object({
  hash: z.string(),
  page: z.number().min(0).optional(),
  pageSize: z.number().min(0).max(100).optional(),
})

/**
 * 获取书本目录
 */
export const getBookChapters = SA.encode(
  zf(getBookChaptersDto, async (props) => {
    const { hash, page = 0, pageSize = 20 } = props
    const book = await prisma.book
      .findUnique({
        where: {
          hash,
        },
        select: {
          status: true,
          nsfw: true,
          chapters: {
            select: {
              hash: true,
              name: true,
            },
            orderBy: {
              index: 'asc',
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
          },
          _count: {
            select: {
              chapters: true,
            },
          },
        },
      })
      .then(await ensureBookAccessibleToUser())
    return {
      total: book._count.chapters,
      page,
      pageSize,
      chapters: book.chapters,
    }
  })
)

const getBooksDto = z.object({
  tagHash: z.string().optional(),
  name: z.string().min(0).max(300).optional(),
})

/**
 * 获取书本列表
 */
export const getBooks = SA.encode(
  zf(getBooksDto, async (props) => {
    const { tagHash, name } = props
    const books = await prisma.book.findMany({
      where: {
        tags: {
          some: {
            hash: tagHash,
          },
        },
        name: {
          contains: name,
        },
      },
      select: bookSelectWithTags,
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
      take: 50,
    })
    const ensureBookAccessible = await ensureBookAccessibleToUser()
    const res = books.filter((book) => {
      try {
        ensureBookAccessible(book)
        return true
      } catch (_) {
        return false
      }
    })
    return res
  })
)

const getBookChapterDto = z.object({
  hash: z.string(),
  /**
   * 从 0 开始
   */
  chapterIndex: z.number().min(0),
})

/**
 * 获取章节内容
 */
export const getBookChapter = SA.encode(
  zf(getBookChapterDto, async (props) => {
    const { hash, chapterIndex } = props
    // 返回书的名称、当前章节内容、前后章节 hash
    const chapterInfo = await prisma.bookChapter.findFirst({
      where: {
        bookHash: hash,
        index: chapterIndex,
      },
      select: {
        name: true,
        content: true,
        book: {
          select: {
            status: true,
            nsfw: true,
          },
        },
      },
    })
    if (!chapterInfo) {
      throw Boom.notFound('章节不存在')
    }
    const { book, ...chapter } = chapterInfo
    ;(await ensureBookAccessibleToUser())(book)
    return chapter
  })
)

/**
 * 获取前后章节名
 */
export const getBookChapterNames = SA.encode(
  zf(getBookChapterDto, async (props) => {
    const { hash, chapterIndex } = props
    // 返回前后章节的 hash 和名称
    const chapterInfos = await prisma.bookChapter.findMany({
      where: {
        bookHash: hash,
        index: {
          gte: chapterIndex - 1,
          lte: chapterIndex + 1,
        },
      },
      select: {
        name: true,
        index: true,
      },
    })
    return chapterInfos
  })
)
