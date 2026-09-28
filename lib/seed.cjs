require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function generateAccountNumber() {
  while (true) {
    const candidate = Math.floor(100000000 + Math.random() * 900000000);
    const existing = await prisma.user.findUnique({ where: { accountNumber: candidate } });
    if (!existing) return candidate;
  }
}

async function main() {
  console.log('Starting database seed...');

  // Check if building already exists
  let building = await prisma.building.findFirst({
    where: { name: 'Lux Sitesi A Blok' }
  });

  if (!building) {
    console.log('Creating test building...');

    building = await prisma.building.create({
      data: {
        name: 'Lux Sitesi A Blok',
        type: 'SITE',
        totalBlocks: 3,
        address: 'Atatürk Mah. Cumhuriyet Cad. No:123',
      },
    });

    console.log('✓ Created building:', building.name);

    console.log('Creating test unit...');

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
  } else {
    console.log('Building already exists, skipping building/unit creation');
  }

  // Create SUPER_ADMIN user if it doesn't exist
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@luxdues.com' },
  });

  if (!existingAdmin) {
    console.log('Creating super admin user...');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    const admin = await prisma.user.create({
      data: {
        accountNumber: await generateAccountNumber(),
        name: 'Sistem Yöneticisi',
        email: 'admin@luxdues.com',
        phone: '+905550000000',
        password: hashedPassword,
        emailVerified: true,
        role: 'SUPER_ADMIN',
      },
    });

    console.log('✓ Created super admin:', admin.email, '(password: Admin123!)');
  } else {
    console.log('Super admin already exists, skipping');
  }

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
