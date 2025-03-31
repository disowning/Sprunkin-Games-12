const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const admins = await prisma.user.findMany({
    where: {
      role: 'ADMIN'
    },
    select: {
      email: true,
      name: true,
      role: true
    }
  })
  
  console.log('管理员账户:', admins)
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  }) 