import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import HomeClient from './HomeClient';

// Server component: resolves the session and public platform stats before the
// first paint so the header and stats never flash empty/loading states.
export default async function LandingPage() {
  const session = await getSession();

  const [totalBuildings, totalUnits, totalAdmins] = await Promise.all([
    prisma.building.count(),
    prisma.unit.count(),
    prisma.user.count({ where: { role: { in: [UserRole.SUPER_ADMIN, UserRole.BLOCK_ADMIN] } } }),
  ]);

  return (
    <HomeClient
      initialSession={session ? { name: session.name, role: session.role, avatarUrl: session.avatarUrl } : null}
      initialStats={{ totalBuildings, totalUnits, totalAdmins }}
    />
  );
}
