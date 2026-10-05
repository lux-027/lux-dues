require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Cleaning all buildings and units...');

  // Delete all units first (foreign key constraint)
  const deletedUnits = await prisma.unit.deleteMany({});
  console.log(`✓ Deleted ${deletedUnits.count} units`);

  // Delete all buildings
  const deletedBuildings = await prisma.building.deleteMany({});
  console.log(`✓ Deleted ${deletedBuildings.count} buildings`);

  // Keep super admin, but update their buildingId to null
  await prisma.user.updateMany({
    where: { role: 'SUPER_ADMIN' },
    data: { buildingId: null },
  });
  console.log('✓ Updated super admin buildingId to null');

  console.log('✓ Cleanup completed!');
  console.log('Note: Super admin user is preserved.');
}

main()
  .catch((e) => {
    console.error('✗ Error cleaning database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
