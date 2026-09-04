/**
 * Helpers for the user-facing account number (a sequential 9-digit ID),
 * displayed grouped in 3s, e.g. 1 -> "000 000 001".
 */

/**
 * Formats a numeric account number as a 9-digit string grouped in 3s.
 */
export function formatAccountNumber(accountNumber: number | string): string {
  const digits = String(accountNumber).replace(/\D/g, '').padStart(9, '0').slice(-9);
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
}

/**
 * Parses a formatted (or raw) account number string back into a number.
 * Returns null if the input doesn't contain any digits.
 */
export function parseAccountNumber(value: string): number | null {
  const digits = value.replace(/\D/g, '');
  if (!digits) return null;
  return parseInt(digits, 10);
}
