import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined });
const prisma = new PrismaClient({ adapter });

const me = await prisma.user.findUnique({ where: { email: 'emremertdrk00@gmail.com' } });
const otherAdmin = await prisma.user.findUnique({ where: { email: 'lux.studio.tr@gmail.com' } });

// 1) Sahipsiz binaları Cruel Emre'ye bağla
const fixed = await prisma.building.updateMany({
  where: { ownerId: null },
  data: { ownerId: me.id },
});
console.log('Sahip atanan bina:', fixed.count);

// 2) Davetli demo bina: emre direk'in binası, sen A Blok yöneticisisin
let demo = await prisma.building.findFirst({ where: { name: 'Davetli Demo Sitesi' } });
if (!demo) {
  demo = await prisma.building.create({
    data: {
      name: 'Davetli Demo Sitesi',
      type: 'SITE',
      totalBlocks: 2,
      address: 'Demo Mah. Davet Sk. No:5, İstanbul',
      ownerId: otherAdmin.id,
      admins: { connect: { id: me.id } },
      units: {
        create: ['A Blok', 'B Blok'].flatMap((block) =>
          [1, 2, 3, 4].map((n) => ({
            blockName: block,
            doorNo: String(n),
            ownerName: `${block} D:${n}`,
            floor: "1",
            residentPhone: "",
            isVacant: false,
          }))
        ),
      },
    },
  });
  console.log('Demo bina oluşturuldu:', demo.name);
}

// Atama + kabul edilmiş davet
await prisma.buildingAdminAssignment.upsert({
  where: { userId_buildingId_blockName: { userId: me.id, buildingId: demo.id, blockName: 'A Blok' } },
  update: {},
  create: { userId: me.id, buildingId: demo.id, blockName: 'A Blok' },
});
await prisma.adminInvitation.create({
  data: { senderId: otherAdmin.id, receiverId: me.id, buildingId: demo.id, blockName: 'A Blok', status: 'ACCEPTED' },
});
await prisma.user.update({ where: { id: me.id }, data: { buildingId: demo.id, blockName: 'A Blok' } });
console.log('Atama + davet tamam');
await prisma.$disconnect();
