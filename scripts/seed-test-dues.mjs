import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined,
});
const prisma = new PrismaClient({ adapter });

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const NAMES = [
  'Ahmet Yılmaz', 'Ayşe Demir', 'Mehmet Kaya', 'Fatma Şahin', 'Ali Çelik',
  'Zeynep Arslan', 'Mustafa Öztürk', 'Elif Aydın', 'Hüseyin Koç', 'Meryem Kurt',
  'Emre Doğan', 'Selin Yıldız',
];

async function main() {
  // Sahip: en çok binaya sahip kullanıcıyı bul
  const owner = await prisma.user.findFirst({
    where: { ownedBuildings: { some: {} } },
    include: { _count: { select: { ownedBuildings: true } } },
    orderBy: { ownedBuildings: { _count: 'desc' } },
  });
  if (!owner) throw new Error('Bina sahibi kullanıcı bulunamadı');
  console.log('Sahip:', owner.name, owner.email);

  // Test binası
  let building = await prisma.building.findFirst({ where: { name: 'Rapor Test Sitesi', ownerId: owner.id } });
  if (!building) {
    building = await prisma.building.create({
      data: {
        name: 'Rapor Test Sitesi',
        type: 'SITE',
        totalBlocks: 2,
        address: 'Test Mah. Deneme Cad. No:1 Gaziantep',
        ownerId: owner.id,
        defaultDueAmount: 1500,
      },
    });
    console.log('Bina oluşturuldu:', building.name);
  } else {
    console.log('Bina zaten var:', building.name);
  }

  // Daireler: 2 blok x 6 daire
  const units = [];
  for (const block of ['A Blok', 'B Blok']) {
    for (let d = 1; d <= 6; d++) {
      const name = rand(NAMES);
      const unit = await prisma.unit.upsert({
        where: { buildingId_blockName_doorNo: { buildingId: building.id, blockName: block, doorNo: String(d) } },
        update: {},
        create: {
          buildingId: building.id,
          blockName: block,
          doorNo: String(d),
          floor: String(Math.ceil(d / 3)),
          ownerName: name,
          residentPhone: '',
          defaultDueAmount: 1500,
        },
      });
      units.push(unit);
    }
  }
  console.log('Daireler hazır:', units.length);

  // Aidatlar: bu ay + geçen ay, rastgele PAID/UNPAID, rastgele tutar
  const now = new Date();
  const periods = [
    { year: now.getFullYear(), month: now.getMonth() + 1 },
    { year: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(), month: now.getMonth() === 0 ? 12 : now.getMonth() },
  ];

  let created = 0;
  for (const p of periods) {
    for (const u of units) {
      const amount = rand([1000, 1250, 1500, 1500, 1750, 2000]);
      const status = Math.random() < 0.55 ? 'PAID' : 'UNPAID';
      await prisma.dues.upsert({
        where: { unitId_month_year: { unitId: u.id, month: p.month, year: p.year } },
        update: { amount, status, dueDate: new Date(p.year, p.month - 1, 10) },
        create: { unitId: u.id, amount, month: p.month, year: p.year, status, dueDate: new Date(p.year, p.month - 1, 10) },
      });
      created++;
    }
  }
  console.log(`✓ ${created} aidat kaydı oluşturuldu (${periods.map((p) => `${p.month}/${p.year}`).join(' + ')})`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
