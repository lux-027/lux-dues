require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const identifier = process.argv[2];
  if (!identifier) {
    console.error('Kullanıcı e-postası veya adı girin.');
    process.exit(1);
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: identifier, mode: 'insensitive' } },
        { name: { contains: identifier, mode: 'insensitive' } },
      ],
    },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!existing) {
    console.error('Kullanıcı bulunamadı:', identifier);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { id: existing.id },
    data: { role: 'SUPER_ADMIN' },
    select: { id: true, email: true, name: true, role: true },
  });

  console.log('Yönetici yapıldı:', JSON.stringify(updated, null, 2));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
