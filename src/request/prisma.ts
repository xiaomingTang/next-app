import { PrismaClient } from '@prisma/client'

// 仅 dev 环境下才会写 global, 所以不能覆写 global 的类型,
// 避免在其他地方使用 global 时出现类型错误,
// 如果覆写了 global 的类型, 其他地方不从该文件 import prisma:
// 类型不会报错, 本地 dev 不会报错, 构建后才会报错
type DevGlobal = typeof global & {
  prisma: PrismaClient
}

export const prisma: PrismaClient =
  (global as DevGlobal).prisma || new PrismaClient()

// md 暂且试试一律不 new;
// 因为按官网的 best practice (如下) 仍然会导致 aws rds Too many connects
// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
;(global as DevGlobal).prisma = prisma
