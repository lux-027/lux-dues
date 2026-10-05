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

  // Only create SUPER_ADMIN user if it doesn't exist
  // No test buildings or units - users create their own data
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
  console.log('Note: No test buildings created. Users will create their own buildings.');
}

main()
  .catch((e) => {
    console.error('✗ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
