import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // 创建默认管理员
  const adminExists = await prisma.user.findUnique({
    where: {
      email: 'admin@example.com'
    }
  })

  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'ADMIN'
      }
    })
    console.log('默认管理员用户已创建')
  }

  // 创建默认分类
  const categories = [
    { name: '动作游戏', slug: 'action' },
    { name: '策略游戏', slug: 'strategy' },
    { name: '解谜游戏', slug: 'puzzle' },
    { name: '射击游戏', slug: 'shooter' },
    { name: '冒险游戏', slug: 'adventure' }
  ]

  for (const category of categories) {
    const exists = await prisma.category.findUnique({
      where: { slug: category.slug }
    })

    if (!exists) {
      await prisma.category.create({
        data: {
          id: Math.random().toString(36).substring(2, 15),
          name: category.name,
          slug: category.slug,
          updatedAt: new Date()
        }
      })
      console.log(`分类已创建: ${category.name}`)
    }
  }

  // 创建默认标签
  const tags = [
    { name: '热门', slug: 'hot' },
    { name: '新游戏', slug: 'new' },
    { name: '多人', slug: 'multiplayer' },
    { name: '单人', slug: 'singleplayer' },
    { name: '休闲', slug: 'casual' }
  ]

  for (const tag of tags) {
    const exists = await prisma.tag.findUnique({
      where: { slug: tag.slug }
    })

    if (!exists) {
      await prisma.tag.create({
        data: {
          name: tag.name,
          slug: tag.slug,
          updatedAt: new Date()
        }
      })
      console.log(`标签已创建: ${tag.name}`)
    }
  }

  // 设置默认站点配置
  const siteConfigs = [
    { key: 'siteName', value: 'Sprunkin Games' },
    { key: 'siteDescription', value: '最好玩的在线HTML5游戏平台' },
    { key: 'siteKeywords', value: '游戏,HTML5,在线游戏,免费游戏' },
    { key: 'contactEmail', value: 'contact@example.com' },
    { key: 'footerText', value: '© 2025 Sprunkin Games. 保留所有权利。' }
  ]

  for (const config of siteConfigs) {
    const exists = await prisma.siteconfig.findUnique({
      where: { key: config.key }
    })

    if (!exists) {
      await prisma.siteconfig.create({
        data: {
          id: Math.random().toString(36).substring(2, 15),
          key: config.key,
          value: config.value,
          updatedAt: new Date()
        }
      })
      console.log(`站点配置已创建: ${config.key}`)
    }
  }

  console.log('种子数据已成功添加')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })