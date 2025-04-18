'use server'

// ✅ 所有书 /b/t/?p=1&s=xxx
// ✅ 某个标签内所有书 /b/t/{tagHash}/?p=1&s=xxx
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
import { nanoid } from 'nanoid'

import type { BookStatus, User } from '@prisma/client'

const ALL_BOOK_STATUS = ['UNPUBLISHED', 'PUBLISHED', 'DELETED'] as const

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

const getBooksDto = z.object({
  tagHash: z.string().optional(),
  name: z.string().min(0).max(300).optional(),
  page: z.number().min(0).optional(),
  pageSize: z.number().min(0).max(100).optional(),
})

/**
 * 获取书本列表
 */
export const getBooks = SA.encode(
  zf(getBooksDto, async (props) => {
    const { tagHash, name, page = 0, pageSize = 50 } = props
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
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
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
    const { hash, page = 0, pageSize = 50 } = props
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
              index: true,
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
    // 返回书的名称、当前章节内容
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

const addBookDto = z.object({
  name: z.string().min(1).max(300),
  author: z.string().max(300).optional(),
  nsfw: z.boolean().optional(),
  description: z.string().max(1000).optional(),
  cover: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(ALL_BOOK_STATUS).optional(),
})

export const addBook = SA.encode(
  zf(addBookDto, async (props) => {
    const { name, author, nsfw, description, cover, tags, status } = props
    ensureUser(await getSelf(), {
      roles: ['ADMIN'],
    })
    const book = await prisma.book.create({
      data: {
        hash: nanoid(12),
        name,
        author,
        nsfw,
        description,
        cover,
        status,
        tags: {
          connect: tags?.map((tag) => ({
            hash: tag,
          })),
        },
      },
      select: bookSelectWithTags,
    })
    return book
  })
)

const updateBookDto = z.object({
  hash: z.string(),
  author: z.string().max(300).optional(),
  nsfw: z.boolean().optional(),
  description: z.string().max(1000).optional(),
  cover: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(ALL_BOOK_STATUS).optional(),
})

export const updateBook = SA.encode(
  zf(updateBookDto, async (props) => {
    const { hash, author, nsfw, description, cover, tags, status } = props
    ensureUser(await getSelf(), {
      roles: ['ADMIN'],
    })
    const book = await prisma.book.update({
      where: {
        hash,
      },
      data: {
        author,
        nsfw,
        description,
        cover,
        status,
        tags: {
          set: [],
          connect: tags?.map((tag) => ({
            hash: tag,
          })),
        },
      },
      select: bookSelectWithTags,
    })
    return book
  })
)

const addBookChapterDto = z.object({
  bookHash: z.string(),
  name: z.string().max(300),
  content: z.string().optional(),
  index: z.number().min(0).optional(),
})

/**
 * 添加章节
 */
export const addBookChapter = SA.encode(
  zf(addBookChapterDto, async (props) => {
    const { bookHash, name, content } = props
    let { index } = props
    ensureUser(await getSelf(), {
      roles: ['ADMIN'],
    })
    const res = await prisma.$transaction(async (p) => {
      if (index !== undefined) {
        await p.bookChapter.updateMany({
          where: {
            bookHash,
            index: {
              gte: index,
            },
          },
          data: {
            index: {
              increment: 1,
            },
          },
        })
      } else {
        // 获取当前最大章节数
        const maxIndex = await p.bookChapter.count({
          where: {
            bookHash,
          },
        })
        index = maxIndex
      }
      return p.bookChapter.create({
        data: {
          hash: nanoid(12),
          name,
          content,
          index,
          bookHash,
        },
      })
    })
    return res
  })
)

const updateBookChapterDto = z.object({
  hash: z.string(),
  name: z.string().max(300).optional(),
  content: z.string().optional(),
})

/**
 * 更新章节
 */
export const updateBookChapter = SA.encode(
  zf(updateBookChapterDto, async (props) => {
    const { hash, name, content } = props
    ensureUser(await getSelf(), {
      roles: ['ADMIN'],
    })
    const res = await prisma.bookChapter.update({
      where: {
        hash,
      },
      data: {
        name,
        content,
      },
    })
    return res
  })
)

const deleteBookChaptersDto = z.object({
  bookHash: z.string(),
  chapters: z.array(
    z.object({
      hash: z.string(),
      index: z.number().min(0),
    })
  ),
})

export const deleteBookChapters = SA.encode(
  zf(deleteBookChaptersDto, async (props) => {
    ensureUser(await getSelf(), {
      roles: ['ADMIN'],
    })
    const { bookHash, chapters } = props
    if (chapters.length === 0) {
      throw Boom.badRequest('待删除章节不能为空')
    }
    // 升序排列
    const sortedChapters = chapters.sort((a, b) => a.index - b.index)
    const minIndex = sortedChapters[0].index
    const maxIndex = sortedChapters[sortedChapters.length - 1].index
    if (!sortedChapters.every((item, i) => item.index - i === minIndex)) {
      throw Boom.badRequest('只能同时删除连续的若干章节')
    }
    await prisma.$transaction([
      prisma.bookChapter.deleteMany({
        where: {
          bookHash,
          hash: {
            in: chapters.map((p) => p.hash),
          },
        },
      }),
      prisma.bookChapter.updateMany({
        where: {
          bookHash: bookHash,
          index: {
            gt: maxIndex,
          },
        },
        data: {
          index: {
            decrement: maxIndex - minIndex + 1,
          },
        },
      }),
    ])
  })
)

export const getBookTags = SA.encode(async () => {
  const tags = await prisma.bookTag.findMany({
    select: {
      hash: true,
      name: true,
      _count: {
        select: {
          books: true,
        },
      },
    },
  })
  return tags
})
