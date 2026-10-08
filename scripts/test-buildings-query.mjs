import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined });
const prisma = new PrismaClient({ adapter });
const session = { id: 'cmuvkw8vq000004lbr58u8b9h' };
const buildings = await prisma.building.findMany({
  where: { OR: [
    { ownerId: session.id },
    { admins: { some: { id: session.id } } },
    { adminAssignments: { some: { userId: session.id } } },
  ]},
  include: { _count: { select: { units: true, admins: true, complaints: true, specialProjects: true } }, units: { select: { id: true, isVacant: true, residents: { select: { id: true } } } } },
  orderBy: { createdAt: 'desc' },
});
console.log('Sonuç:', buildings.map(b => `${b.name} (sahip: ${b.ownerId === session.id})`));
await prisma.$disconnect();
