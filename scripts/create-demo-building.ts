import { prisma } from '../lib/prisma';
import { BuildingType, PaymentStatus, UserRole } from '@prisma/client';
import { generateUniqueAccountNumber } from '../lib/accountNumber';

async function main() {
  console.log('--- Creating/linking trial demo building and demo resident ---');

  // 1. Find or create demo resident user
  let demoResident = await prisma.user.findFirst({
    where: { email: 'sakin@luxdues.com' },
  });

  if (!demoResident) {
    const accNum = await generateUniqueAccountNumber();
    demoResident = await prisma.user.create({
      data: {
        accountNumber: accNum,
        name: 'Demo Site Sakini',
        email: 'sakin@luxdues.com',
        phone: '+905551112233',
        emailVerified: true,
        role: UserRole.RESIDENT,
      },
    });
    console.log('Created demo resident:', demoResident.name, demoResident.accountNumber);
  } else {
    console.log('Found demo resident:', demoResident.name, demoResident.accountNumber);
  }

  // 2. Find or create demo trial building
  let trialBuilding = await prisma.building.findFirst({
    where: { name: 'Dev Park Sitesi' },
  });

  if (!trialBuilding) {
    trialBuilding = await prisma.building.create({
      data: {
        name: 'Dev Park Sitesi',
        type: BuildingType.SITE,
        totalBlocks: 2,
        address: 'Gaziantep Şahinbey Abdulhamithan Mah. 1023. Cad No: 17',
        image: '/photo-1512917774080-9991f1c4c750.jpg',
        defaultDueAmount: 1500,
      },
    });
    console.log('Created trial building:', trialBuilding.name);
  } else {
    console.log('Found trial building:', trialBuilding.name);
  }

  // 3. Create or find unit in trialBuilding and link to demoResident
  let unit1 = await prisma.unit.findFirst({
    where: {
      buildingId: trialBuilding.id,
      blockName: 'A Blok',
      doorNo: '1',
    },
  });

  if (!unit1) {
    unit1 = await prisma.unit.create({
      data: {
        buildingId: trialBuilding.id,
        blockName: 'A Blok',
        doorNo: '1',
        floor: '1',
        ownerName: demoResident.name,
        residentPhone: demoResident.phone,
        defaultDueAmount: 1500,
        isVacant: false,
        residents: {
          connect: [{ id: demoResident.id }],
        },
      },
    });
    console.log('Created and connected unit 1 to demo resident');
  } else {
    await prisma.unit.update({
      where: { id: unit1.id },
      data: {
        ownerName: demoResident.name,
        residentPhone: demoResident.phone,
        isVacant: false,
        residents: {
          connect: [{ id: demoResident.id }],
        },
      },
    });
    console.log('Updated and linked unit 1 to demo resident');
  }

  // Create another unit in B Blok (empty/vacant demo)
  let unit2 = await prisma.unit.findFirst({
    where: {
      buildingId: trialBuilding.id,
      blockName: 'B Blok',
      doorNo: '2',
    },
  });

  if (!unit2) {
    unit2 = await prisma.unit.create({
      data: {
        buildingId: trialBuilding.id,
        blockName: 'B Blok',
        doorNo: '2',
        floor: '1',
        ownerName: 'Boş Daire',
        residentPhone: '',
        defaultDueAmount: 1500,
        isVacant: true,
      },
    });
    console.log('Created unit 2 (Vacant)');
  }

  // Ensure dues exist for demo resident unit1
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  await prisma.dues.upsert({
    where: {
      unitId_month_year: {
        unitId: unit1.id,
        month: currentMonth,
        year: currentYear,
      },
    },
    update: {
      amount: 1500,
      status: PaymentStatus.UNPAID,
      dueDate: new Date(currentYear, currentMonth - 1, 28),
    },
    create: {
      unitId: unit1.id,
      amount: 1500,
      month: currentMonth,
      year: currentYear,
      status: PaymentStatus.UNPAID,
      dueDate: new Date(currentYear, currentMonth - 1, 28),
    },
  });

  // Ensure demo login endpoint links to this demo resident properly
  console.log('✓ Trial building and demo resident successfully linked!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
