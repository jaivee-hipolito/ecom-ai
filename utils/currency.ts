/**
 * Format a number as currency with proper masking
 * @param amount - The amount to format
 * @param currency - The currency symbol (default: '$')
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number | string, currency: string = '$'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return `${currency}0.00`;
  }
  
  // Format with commas for thousands and always 2 decimal places
  return `${currency}${numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format a number as currency without the currency symbol
 * @param amount - The amount to format
 * @returns Formatted number string (e.g., "1,234.56")
 */
export function formatCurrencyAmount(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0.00';
  }
  
  // Format with commas for thousands and always 2 decimal places
  return numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format a value for display in a currency input (with $ and commas)
 * @param value - The value (number or string)
 * @returns Formatted string (e.g., "$1,234.56") or empty string
 */
export function formatCurrencyForInput(value: number | string | undefined | null): string {
  if (value === '' || value === undefined || value === null) return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Parse a currency input string to a number
 * @param value - The input string (e.g., "$1,234.56" or "1234.56")
 * @returns Parsed number or NaN
 */
export function parseCurrencyInput(value: string): number {
  if (!value || typeof value !== 'string') return NaN;
  const cleaned = value.replace(/[$,]/g, '').trim();
  return parseFloat(cleaned);
}
