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

  // ---------------------------------------------------------------------
  // Demo data top-up: bring the platform to a representative baseline of
  // 12 sites / 184 units / 9 admins for the public landing page stats.
  // Idempotent: only creates what's missing, safe to re-run.
  // ---------------------------------------------------------------------
  const TARGET_BUILDINGS = 12;
  const TARGET_UNITS = 164;
  const TARGET_ADMINS = 9;

  const buildingNames = [
    'Yeşil Vadi Sitesi', 'Panorama Rezidans', 'Palmiye Konutları', 'Mavi Deniz Sitesi',
    'Çamlık Apartmanı', 'Gökkuşağı Sitesi', 'Zümrüt Konakları', 'İnci Sitesi',
    'Yıldız Apartmanı', 'Bahçeşehir Konakları', 'Nova Rezidans', 'Kristal Sitesi',
  ];
  const districts = [
    'Kadıköy', 'Beşiktaş', 'Çankaya', 'Konak', 'Nilüfer', 'Muratpaşa',
    'Osmangazi', 'Bornova', 'Etimesgut', 'Maltepe', 'Şişli', 'Karşıyaka',
  ];
  const ownerFirstNames = ['Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Ali', 'Zeynep', 'Mustafa', 'Elif', 'Hüseyin', 'Emine', 'Hasan', 'Hatice', 'İbrahim', 'Merve', 'Osman'];
  const ownerLastNames = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Aydın', 'Özdemir', 'Arslan', 'Doğan'];

  console.log('Topping up demo data (buildings/units/admins)...');

  // 1) Top up buildings to TARGET_BUILDINGS
  let allBuildings = await prisma.building.findMany();
  let bIdx = allBuildings.length;
  while (allBuildings.length < TARGET_BUILDINGS) {
    const baseName = buildingNames[bIdx % buildingNames.length];
    const name = bIdx < buildingNames.length ? baseName : `${baseName} ${Math.floor(bIdx / buildingNames.length) + 1}`;
    const newBuilding = await prisma.building.create({
      data: {
        name,
        type: bIdx % 2 === 0 ? 'SITE' : 'APARTMENT',
        totalBlocks: (bIdx % 3) + 1,
        address: `${districts[bIdx % districts.length]} Mah. ${bIdx + 1}. Sk. No:${bIdx + 1}`,
      },
    });
    allBuildings.push(newBuilding);
    bIdx++;
  }
  console.log(`✓ Buildings ready: ${allBuildings.length}`);

  // 2) Top up units to TARGET_UNITS, distributed round-robin across buildings
  let totalUnits = await prisma.unit.count();
  let safety = 0;
  let rr = 0;
  while (totalUnits < TARGET_UNITS && safety < TARGET_UNITS * 3) {
    safety++;
    const b = allBuildings[rr % allBuildings.length];
    rr++;
    const existingForBuilding = await prisma.unit.count({ where: { buildingId: b.id } });
    const blockLetter = String.fromCharCode(65 + Math.floor(existingForBuilding / 10) % 4); // A, B, C, D
    const doorNo = String((existingForBuilding % 10) + 1);
    const floor = String(Math.floor(existingForBuilding / 10) + 1);

    try {
      await prisma.unit.create({
        data: {
          buildingId: b.id,
          blockName: blockLetter,
          doorNo,
          floor,
          ownerName: `${ownerFirstNames[totalUnits % ownerFirstNames.length]} ${ownerLastNames[totalUnits % ownerLastNames.length]}`,
          residentPhone: `+9055${String(50000000 + totalUnits).padStart(8, '0')}`,
        },
      });
      totalUnits++;
    } catch {
      // Unique constraint collision (blockName+doorNo already used for this
      // building) — just retry on the next building in the round-robin.
    }
  }
  console.log(`✓ Units ready: ${totalUnits}`);

  // 3) Top up admins (BLOCK_ADMIN) to TARGET_ADMINS (includes existing SUPER_ADMIN)
  let totalAdmins = await prisma.user.count({
    where: { role: { in: ['SUPER_ADMIN', 'BLOCK_ADMIN'] } },
  });
  let aIdx = 0;
  while (totalAdmins < TARGET_ADMINS && aIdx < 50) {
    const email = `blok.yoneticisi${aIdx + 1}@luxdues.com`;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      const b = allBuildings[aIdx % allBuildings.length];
      await prisma.user.create({
        data: {
          accountNumber: await generateAccountNumber(),
          name: `${ownerFirstNames[aIdx % ownerFirstNames.length]} ${ownerLastNames[(aIdx + 3) % ownerLastNames.length]}`,
          email,
          phone: `+9055${String(60000000 + aIdx).padStart(8, '0')}`,
          password: hashedPassword,
          emailVerified: true,
          role: 'BLOCK_ADMIN',
          buildingId: b.id,
        },
      });
      totalAdmins++;
    }
    aIdx++;
  }
  console.log(`✓ Admins ready: ${totalAdmins}`);

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
