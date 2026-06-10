// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 A executar seed da base de dados...')

  // Admin padrão — alterar a password no primeiro login
  const passwordHash = await bcrypt.hash('INP@Admin2025!', 12)

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@inp.co.ao' },
    update: {},
    create: {
      email: 'admin@inp.co.ao',
      passwordHash,
      nome: 'Administrador INP',
    },
  })

  console.log(`✅ Admin criado: ${admin.email}`)
  console.log('⚠️  Altere a password após o primeiro login!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
