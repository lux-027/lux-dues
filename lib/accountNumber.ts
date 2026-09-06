import { prisma } from './prisma';

/**
 * Generates a unique, random 9-digit account number for a user.
 * The number is between 100000000 and 999999999 and checked against
 * the database to avoid collisions.
 */
export async function generateUniqueAccountNumber(): Promise<number> {
  while (true) {
    const candidate = Math.floor(100000000 + Math.random() * 900000000);
    const existing = await (prisma as any).user.findFirst({
      where: {
        OR: [
          { accountNumber: candidate },
          { adminAccountNumber: candidate },
          { residentAccountNumber: candidate },
        ],
      },
    });
    if (!existing) return candidate;
  }
}
