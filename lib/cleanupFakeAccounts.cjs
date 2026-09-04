require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const fakeUsers = await prisma.user.findMany({
    where: {
      email: { endsWith: '@luxdues.com' },
    },
    select: { id: true, email: true, name: true },
  });

  if (fakeUsers.length === 0) {
    console.log('Silinecek sahte hesap yok.');
    await prisma.$disconnect();
    return;
  }

  const ids = fakeUsers.map((u) => u.id);

  console.log('Silinecek hesaplar:', fakeUsers.map((u) => `${u.name} (${u.email})`).join(', '));

  await prisma.complaint.updateMany({
    where: { userId: { in: ids } },
    data: { userId: null },
  });

  await prisma.adminInvitation.deleteMany({
    where: { OR: [{ senderId: { in: ids } }, { receiverId: { in: ids } }] },
  });

  const result = await prisma.user.deleteMany({
    where: { id: { in: ids } },
  });

  console.log(`${result.count} sahte hesap silindi.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
