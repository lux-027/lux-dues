import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined });
const prisma = new PrismaClient({ adapter });

const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, buildingId: true, blockName: true } });
console.log('--- USERS ---');
users.forEach(u => console.log(u.id.slice(0,8), '|', u.name, '|', u.email, '|', u.role, '| bina:', u.buildingId?.slice(0,8), u.blockName));

const buildings = await prisma.building.findMany({ select: { id: true, name: true, ownerId: true, type: true, _count: { select: { units: true } } } });
console.log('--- BUILDINGS ---');
buildings.forEach(b => console.log(b.id.slice(0,8), '|', b.name, '| sahip:', b.ownerId?.slice(0,8), '|', b.type, '| daire:', b._count.units));

const assigns = await prisma.buildingAdminAssignment.findMany();
console.log('--- ASSIGNMENTS ---');
assigns.forEach(a => console.log('user', a.userId.slice(0,8), '-> bina', a.buildingId.slice(0,8), a.blockName));
await prisma.$disconnect();
