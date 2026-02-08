/**
 * Phone number normalization utility
 * Normalizes phone numbers to a consistent format for storage and comparison
 */

/**
 * Normalize phone number by removing all non-digit characters except +
 * This ensures consistent storage and comparison
 * 
 * @param phoneNumber - The phone number to normalize
 * @returns Normalized phone number (digits only, optionally with + prefix)
 */
export function normalizePhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters except +
  const normalized = phoneNumber.replace(/[^\d+]/g, '');
  
  // If it starts with +, keep it, otherwise return digits only
  return normalized.startsWith('+') ? normalized : normalized;
}

/**
 * Format phone number for display
 * Formats as: (XXX) XXX-XXXX or +X XXX XXX XXXX
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  const normalized = normalizePhoneNumber(phoneNumber);
  
  // If it has country code (+), format differently
  if (normalized.startsWith('+')) {
    const countryCode = normalized.substring(0, 2);
    const number = normalized.substring(2);
    
    if (number.length === 10) {
      return `+${countryCode} (${number.substring(0, 3)}) ${number.substring(3, 6)}-${number.substring(6)}`;
    }
    return normalized;
  }
  
  // Format as (XXX) XXX-XXXX
  if (normalized.length === 10) {
    return `(${normalized.substring(0, 3)}) ${normalized.substring(3, 6)}-${normalized.substring(6)}`;
  }
  
  return normalized;
}
