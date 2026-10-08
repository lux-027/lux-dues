import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined,
});
const prisma = new PrismaClient({ adapter });

// Existing invited admins stored on user.buildingId/blockName -> copy into assignments
const admins = await prisma.user.findMany({
  where: { role: { in: ['BLOCK_ADMIN', 'SUPER_ADMIN'] }, buildingId: { not: null } },
  select: { id: true, buildingId: true, blockName: true },
});
let created = 0;
for (const a of admins) {
  try {
    await prisma.buildingAdminAssignment.create({
      data: { userId: a.id, buildingId: a.buildingId, blockName: a.blockName },
    });
    created++;
  } catch { /* already exists */ }
}
console.log(`${admins.length} yönetici tarandı, ${created} atama eklendi.`);
await prisma.$disconnect();
