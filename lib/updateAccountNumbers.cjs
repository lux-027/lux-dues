require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function generate() {
  return Math.floor(100000000 + Math.random() * 900000000);
}

async function main() {
  console.log('Fetching existing users...');
  const users = await prisma.user.findMany({ select: { id: true } });

  const taken = new Set();
  const updates = [];

  for (const user of users) {
    let n;
    do {
      n = generate();
    } while (taken.has(n));
    taken.add(n);

    updates.push(
      prisma.user.update({
        where: { id: user.id },
        data: { accountNumber: n },
      })
    );
  }

  console.log(`Assigning random account numbers to ${users.length} users...`);
  await prisma.$transaction(updates);
  console.log('Account numbers updated successfully.');
}

main()
  .catch((e) => {
    console.error('Error updating account numbers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
