/**
 * Validates a Vietnamese CCCD (Citizen Identity Card) number
 * Format: 12 digits
 *
 * @param cccd - The CCCD number to validate
 * @returns boolean - True if the CCCD is valid, false otherwise
 */
export function validateCCCD(ccd: string): boolean {
  // Remove any non-digit characters
  const cleaned = ccd.replace(/\D/g, "");

  // CCCD must be exactly 12 digits
  if (cleaned.length !== 12) {
    return false;
  }

  // Check if all characters are digits
  return /^\d{12}$/.test(cleaned);
}
