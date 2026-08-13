import { prisma } from './prisma';
import { BuildingType } from '@prisma/client';

async function main() {
  console.log('Starting database seed...');

  // Check if building already exists
  const existingBuilding = await prisma.building.findFirst({
    where: { name: 'Lux Sitesi A Blok' }
  });

  if (existingBuilding) {
    console.log('Building already exists, skipping seed');
    return;
  }

  console.log('Creating test building...');

  // Create a test building
  const building = await prisma.building.create({
    data: {
      name: 'Lux Sitesi A Blok',
      type: BuildingType.SITE,
      totalBlocks: 3,
      address: 'Atatürk Mah. Cumhuriyet Cad. No:123',
    },
  });

  console.log('✓ Created building:', building.name);

  console.log('Creating test unit...');

  // Create a test unit
  const unit = await prisma.unit.create({
    data: {
      buildingId: building.id,
      blockName: 'A',
      doorNo: '1',
      floor: '1',
      ownerName: 'Ahmet Yılmaz',
      residentPhone: '+905551234567',
    },
  });

  console.log('✓ Created unit:', unit.doorNo);

  console.log('✓ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('✗ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
