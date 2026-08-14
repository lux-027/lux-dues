/**
 * Phone number helpers for Turkish mobile numbers.
 *
 * Display format: 5XX XXX XX XX
 * Storage format (E.164): +905XXXXXXXXX
 */

const TURKISH_MOBILE_REGEX = /^\+905[0-9]{9}$/;

/**
 * Strips all non-digit characters and returns only digits.
 */
function toDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Extracts the national part of a Turkish mobile number (10 digits starting with 5).
 * Handles +90, 90, and leading 0 prefixes.
 */
function toNationalNumber(digits: string): string {
  if (digits.startsWith('90') && digits.length > 2) {
    digits = digits.slice(2);
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
}

/**
 * Formats a Turkish mobile number for display with spaces: 5XX XXX XX XX.
 * Non-conforming input is returned as raw digits.
 */
export function formatPhoneNumber(value: string): string {
  const digits = toDigits(value);
  const national = toNationalNumber(digits);

  if (!national.startsWith('5') || national.length > 10) {
    return digits;
  }

  const parts = [
    national.slice(0, 3),
    national.slice(3, 6),
    national.slice(6, 8),
    national.slice(8, 10),
  ].filter(Boolean);

  return parts.join(' ');
}

/**
 * Normalizes a phone number to E.164 format for storage/validation.
 * Accepts inputs like +905551234567, 905551234567, 05551234567, 5551234567.
 */
export function normalizePhoneNumber(value: string): string {
  const digits = toDigits(value);
  const national = toNationalNumber(digits);

  if (national.length === 10 && national.startsWith('5')) {
    return `+90${national}`;
  }

  // Fallback: if already starts with +, keep it; otherwise return trimmed value
  const trimmed = value.trim();
  if (trimmed.startsWith('+')) {
    return trimmed;
  }

  return trimmed;
}

/**
 * Validates whether the number is a Turkish E.164 mobile number.
 */
export function isValidTurkishPhone(value: string): boolean {
  return TURKISH_MOBILE_REGEX.test(value);
}

/**
 * Returns the display value with leading country code as +90 for inputs.
 * Useful when the user types a value that should be shown with the prefix.
 */
export function formatWithCountryCode(value: string): string {
  const normalized = normalizePhoneNumber(value);
  if (isValidTurkishPhone(normalized)) {
    return normalized;
  }
  return value;
}
