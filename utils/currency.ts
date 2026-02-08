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
