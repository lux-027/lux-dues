import { prisma } from './prisma';

interface SessionLike {
  id: string;
  buildingId?: string | null;
  units?: { buildingId: string }[];
}

/**
 * Checks whether the user can manage/view a building:
 * - they own it (ownerId), or
 * - their primary building assignment matches (legacy user.buildingId), or
 * - they have a BuildingAdminAssignment row (invited block admin — works
 *   across any number of buildings), or
 * - they reside in a unit of that building.
 */
export async function canAccessBuilding(session: SessionLike, buildingId: string) {
  if (session.buildingId === buildingId) return true;
  if (session.units?.some((u) => u.buildingId === buildingId)) return true;

  const [building, assignment] = await Promise.all([
    prisma.building.findUnique({ where: { id: buildingId }, select: { ownerId: true } }),
    prisma.buildingAdminAssignment.findFirst({
      where: { userId: session.id, buildingId },
      select: { id: true },
    }),
  ]);

  return building?.ownerId === session.id || Boolean(assignment);
}

/**
 * Returns which blocks of a building the user may manage:
 * - `null`  → full access (owner, or a whole-building assignment)
 * - `[]`    → no access
 * - string[]→ only these block names
 */
export async function getAdminBlockScope(
  session: SessionLike & { blockName?: string | null },
  buildingId: string
): Promise<string[] | null> {
  // Whole-building authority: owner or an assignment without a blockName
  if (session.buildingId === buildingId && !session.blockName) return null;

  const [building, assignments] = await Promise.all([
    prisma.building.findUnique({ where: { id: buildingId }, select: { ownerId: true } }),
    prisma.buildingAdminAssignment.findMany({
      where: { userId: session.id, buildingId },
      select: { blockName: true },
    }),
  ]);

  if (building?.ownerId === session.id) return null;
  if (assignments.some((a) => !a.blockName)) return null;

  const blocks = assignments.map((a) => a.blockName).filter(Boolean) as string[];
  if (session.buildingId === buildingId && session.blockName) blocks.push(session.blockName);
  return Array.from(new Set(blocks));
}

/**
 * Returns all building IDs the user can manage: owned + assigned + legacy
 * primary assignment.
 */
export async function getAdminBuildingIds(session: SessionLike): Promise<string[]> {
  const [owned, assignments] = await Promise.all([
    prisma.building.findMany({ where: { ownerId: session.id }, select: { id: true } }),
    prisma.buildingAdminAssignment.findMany({ where: { userId: session.id }, select: { buildingId: true } }),
  ]);

  const ids = new Set<string>(owned.map((b) => b.id));
  assignments.forEach((a) => ids.add(a.buildingId));
  if (session.buildingId) ids.add(session.buildingId);
  return Array.from(ids);
}
