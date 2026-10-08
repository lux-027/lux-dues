import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined,
});
const prisma = new PrismaClient({ adapter });

const building = await prisma.building.findFirst({ where: { name: 'Rapor Test Sitesi' } });
if (!building) { console.log('Bina bulunamadı'); process.exit(0); }

const units = await prisma.unit.findMany({ where: { buildingId: building.id }, select: { id: true } });
const unitIds = units.map(u => u.id);
await prisma.dues.deleteMany({ where: { unitId: { in: unitIds } } });
await prisma.unit.deleteMany({ where: { buildingId: building.id } });
await prisma.complaint.deleteMany({ where: { buildingId: building.id } });
await prisma.adminInvitation.deleteMany({ where: { buildingId: building.id } });
const projects = await prisma.specialProject.findMany({ where: { buildingId: building.id }, select: { id: true } });
await prisma.projectPayment.deleteMany({ where: { projectId: { in: projects.map(p => p.id) } } });
await prisma.specialProject.deleteMany({ where: { buildingId: building.id } });
await prisma.building.delete({ where: { id: building.id } });
console.log('Silindi:', building.name);
await prisma.$disconnect();
