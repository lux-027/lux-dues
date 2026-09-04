import { cookies } from 'next/headers';
import { verifyToken } from './auth';
import { prisma } from './prisma';

export interface SessionUnit {
  id: string;
  blockName: string;
  doorNo: string;
  floor: string;
  buildingId: string;
  buildingName: string;
}

export interface SessionUser {
  id: string;
  accountNumber: number;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string | null;
  role: 'SUPER_ADMIN' | 'BLOCK_ADMIN' | 'RESIDENT';
  buildingId?: string | null;
  buildingName?: string | null;
  blockName?: string | null;
  units: SessionUnit[];
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      building: { select: { id: true, name: true } },
      units: {
        select: {
          id: true,
          blockName: true,
          doorNo: true,
          floor: true,
          buildingId: true,
          building: { select: { name: true } },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    accountNumber: user.accountNumber,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role,
    buildingId: user.buildingId,
    buildingName: user.building?.name ?? null,
    blockName: (user as any).blockName ?? null,
    units: user.units.map((u) => ({
      id: u.id,
      blockName: u.blockName,
      doorNo: u.doorNo,
      floor: u.floor,
      buildingId: u.buildingId,
      buildingName: u.building.name,
    })),
  };
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth();
  if (session.role !== 'SUPER_ADMIN' && session.role !== 'BLOCK_ADMIN') {
    throw new Error('Forbidden');
  }
  return session;
}
