// Helper functions to format numbers with Turkish thousands separator (dots) and parse back to numeric string

/**
 * Formats a raw numeric string/number into thousands-separated string with dots (e.g. "24000" -> "24.000")
 */
export function formatCurrencyInput(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val).replace(/[^0-9,\.]/g, '');
  if (!str) return '';

  // Separate integer and decimal part (if user types comma or dot for decimal)
  // Standard in TR is dot for thousands, comma for decimals
  const cleanDigits = str.replace(/\./g, '').replace(',', '.');
  const parts = cleanDigits.split('.');
  const intPart = parts[0];
  const decPart = parts.length > 1 ? parts[1] : null;

  if (!intPart && decPart === null) return '';

  const formattedInt = intPart ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0';

  if (decPart !== null) {
    return `${formattedInt},${decPart.slice(0, 2)}`;
  }
  return formattedInt;
}

/**
 * Parses a thousands-formatted string back to clean numeric string (e.g. "24.000,50" -> "24000.50" or "24.000" -> "24000")
 */
export function parseCurrencyInput(val: string): string {
  if (!val) return '';
  const withoutDots = val.replace(/\./g, '');
  const withDotDecimal = withoutDots.replace(',', '.');
  return withDotDecimal.replace(/[^0-9.]/g, '');
}
