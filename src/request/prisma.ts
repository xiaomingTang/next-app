import { ENV_CONFIG } from '@/config'
import { PrismaClient } from '@/generated-prisma-client'

// 仅 dev 环境下才会写 global, 所以不能覆写 global 的类型,
// 避免在其他地方使用 global 时出现类型错误,
// 如果覆写了 global 的类型, 其他地方不从该文件 import prisma:
// 类型不会报错, 本地 dev 不会报错, 构建后才会报错
type DevGlobal = typeof global & {
  prisma: PrismaClient
}

export const prisma: PrismaClient =
  (global as DevGlobal).prisma || new PrismaClient()

if (ENV_CONFIG.public.nodeEnv !== 'production') {
  ;(global as DevGlobal).prisma = prisma
}
