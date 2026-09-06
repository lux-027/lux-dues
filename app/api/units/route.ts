import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { isValidTurkishPhone, normalizePhoneNumber } from '@/lib/phone';

// GET /api/units?buildingId=... - List units for a building
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');

    if (!buildingId) {
      return NextResponse.json({ error: 'buildingId is required' }, { status: 400 });
    }

    // Block admins can only view their own building
    if (session.role === 'BLOCK_ADMIN' && session.buildingId !== buildingId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const units = await prisma.unit.findMany({
      where: { buildingId },
      include: {
        residents: {
          select: {
            id: true,
            accountNumber: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { blockName: 'asc' },
    });

    const sorted = units.sort((a, b) => {
      if (a.blockName !== b.blockName) {
        return a.blockName.localeCompare(b.blockName);
      }
      const aNum = Number(a.doorNo) || 0;
      const bNum = Number(b.doorNo) || 0;
      return aNum - bNum;
    });

    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch units' },
      { status: 500 }
    );
  }
}

// POST /api/units - Create single unit or batch units (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Oturum açık değil. Lütfen tekrar giriş yapın.' }, { status: 401 });
    }
    if (session.role !== 'SUPER_ADMIN' && session.role !== 'BLOCK_ADMIN') {
      return NextResponse.json({ error: `Bu işlem için yönetici yetkisine sahip olmalısınız. Mevcut rolünüz: ${session.role}` }, { status: 403 });
    }

    const body = await request.json();

    // Bulk creation support
    if (Array.isArray(body.units) && body.buildingId) {
      const { buildingId, units } = body;

      if (session.role === 'BLOCK_ADMIN' && session.buildingId !== buildingId) {
        return NextResponse.json({ error: 'Bu bina için yetkiniz bulunmuyor.' }, { status: 403 });
      }

      const createdUnits = [];
      for (const item of units) {
        if (!item.blockName || !item.doorNo || !item.ownerName) continue;
        const phone = item.residentPhone ? normalizePhoneNumber(item.residentPhone) : '';
        const due = item.defaultDueAmount ? parseFloat(item.defaultDueAmount) : null;
        const unit = await prisma.unit.upsert({
          where: {
            buildingId_blockName_doorNo: {
              buildingId,
              blockName: item.blockName,
              doorNo: String(item.doorNo),
            },
          },
          update: {
            floor: String(item.floor || '1'),
            ownerName: item.ownerName,
            residentPhone: phone,
            ...(due !== null && { defaultDueAmount: due }),
          },
          create: {
            buildingId,
            blockName: item.blockName,
            doorNo: String(item.doorNo),
            floor: String(item.floor || '1'),
            ownerName: item.ownerName,
            residentPhone: phone,
            defaultDueAmount: due,
          },
        });
        createdUnits.push(unit);
      }

      return NextResponse.json({ count: createdUnits.length, units: createdUnits }, { status: 201 });
    }

    // Single unit creation
    const { buildingId, blockName, doorNo, floor, ownerName, residentPhone, defaultDueAmount } = body;

    if (!buildingId || !blockName || !doorNo || !floor || !ownerName || !residentPhone) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanları doldurun' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(residentPhone);
    if (!isValidTurkishPhone(normalizedPhone)) {
      return NextResponse.json(
        { error: 'Geçerli bir Türkiye cep telefonu numarası girin' },
        { status: 400 }
      );
    }

    if (session.role === 'BLOCK_ADMIN' && session.buildingId !== buildingId) {
      return NextResponse.json({ error: 'Bu bina için yetkiniz bulunmuyor.' }, { status: 403 });
    }

    const existing = await prisma.unit.findUnique({
      where: {
        buildingId_blockName_doorNo: {
          buildingId,
          blockName,
          doorNo: String(doorNo),
        },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Bu blok ve kapı numarası ile kayıtlı bir daire zaten mevcut` },
        { status: 409 }
      );
    }

    const unit = await prisma.unit.create({
      data: {
        buildingId,
        blockName,
        doorNo: String(doorNo),
        floor: String(floor),
        ownerName,
        residentPhone: normalizedPhone,
        defaultDueAmount: defaultDueAmount ? parseFloat(defaultDueAmount) : null,
      },
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error: any) {
    console.error('Error creating unit:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Bu blok ve daire numarası ile kayıtlı bir daire zaten mevcut' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Daire eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PATCH /api/units - Rename a block: { buildingId, oldBlockName, newBlockName } (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'BLOCK_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { buildingId, oldBlockName, newBlockName } = await request.json();

    if (!buildingId || !oldBlockName || !newBlockName) {
      return NextResponse.json({ error: 'buildingId, oldBlockName ve newBlockName gerekli' }, { status: 400 });
    }

    if (session.role === 'BLOCK_ADMIN' && session.buildingId !== buildingId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await prisma.unit.updateMany({
      where: { buildingId, blockName: oldBlockName },
      data: { blockName: newBlockName },
    });

    await prisma.user.updateMany({
      where: { buildingId, blockName: oldBlockName },
      data: { blockName: newBlockName },
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error('Error renaming block:', error);
    return NextResponse.json(
      { error: 'Blok adı güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE /api/units?buildingId=...&blockName=... - Delete an entire block and its units (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'BLOCK_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');
    const blockName = searchParams.get('blockName');

    if (!buildingId || !blockName) {
      return NextResponse.json({ error: 'buildingId ve blockName gerekli' }, { status: 400 });
    }

    if (session.role === 'BLOCK_ADMIN' && session.buildingId !== buildingId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await prisma.unit.deleteMany({
      where: { buildingId, blockName },
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error('Error deleting block:', error);
    return NextResponse.json(
      { error: 'Blok silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
