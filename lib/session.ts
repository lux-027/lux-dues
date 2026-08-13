import { cookies } from 'next/headers';
import { verifyToken } from './auth';
import { prisma } from './prisma';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'BLOCK_ADMIN' | 'RESIDENT';
  buildingId?: string | null;
  unitId?: string | null;
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
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    buildingId: user.buildingId,
    unitId: user.unitId,
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
