/**
 * Tax calculation utilities for British Columbia, Canada
 * BC has 5% GST (federal) + 7% PST (provincial) = 12% total tax
 */

export interface TaxBreakdown {
  subtotal: number;
  gst: number; // Goods and Services Tax (federal) - 5%
  pst: number; // Provincial Sales Tax - 7%
  totalTax: number; // Combined GST + PST
  total: number; // Subtotal + Total Tax
}

/**
 * Calculate British Columbia taxes
 * @param subtotal - The subtotal amount before taxes
 * @returns Tax breakdown with GST, PST, and totals
 */
export function calculateBCTax(subtotal: number): TaxBreakdown {
  const GST_RATE = 0.05; // 5% federal GST
  const PST_RATE = 0.07; // 7% provincial PST
  
  const gst = subtotal * GST_RATE;
  const pst = subtotal * PST_RATE;
  const totalTax = gst + pst;
  const total = subtotal + totalTax;

  return {
    subtotal,
    gst: Math.round(gst * 100) / 100, // Round to 2 decimal places
    pst: Math.round(pst * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Calculate total tax amount for BC (GST + PST)
 * @param subtotal - The subtotal amount before taxes
 * @returns Total tax amount (12% for BC)
 */
export function calculateBCTaxAmount(subtotal: number): number {
  const TAX_RATE = 0.12; // 12% total (5% GST + 7% PST)
  return Math.round(subtotal * TAX_RATE * 100) / 100;
}
