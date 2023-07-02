import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'

import Boom from '@hapi/boom'

import type { Prisma } from '@prisma/client'

export const getShortUrl = SA.encode(
  async (props: Prisma.ShortUrlWhereUniqueInput) =>
    prisma.shortUrl
      .findUnique({
        where: props,
      })
      .then((res) => {
        if (!res) {
          throw Boom.notFound('该短链不存在')
        }
        return res
      })
)
