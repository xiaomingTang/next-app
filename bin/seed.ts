import { generatePassword } from '@/utils/password'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.createMany({
    data: [
      {
        name: '王小明',
        email: process.env.ADMIN_EMAIL,
        password: generatePassword(process.env.ADMIN_PASSWORD),
        role: 'ADMIN',
      },
    ],
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
