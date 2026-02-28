/**
 * Single source of truth: only selectedAttributes is stored (e.g. { "size(inch)": "7", "color": "black" }).
 * Size and color are derived from it for display and order creation.
 */

/** Get display size and color from selectedAttributes (for UI). */
export function getSizeAndColorFromAttributes(attrs: Record<string, unknown> | null | undefined): {
  size: string | null;
  color: string | null;
} {
  if (!attrs || typeof attrs !== 'object' || Object.keys(attrs).length === 0) {
    return { size: null, color: null };
  }
  let size: string | null = null;
  let color: string | null = null;
  const sizeKey = Object.keys(attrs).find((k) => k.toLowerCase().includes('size'));
  if (sizeKey && attrs[sizeKey] != null && attrs[sizeKey] !== '') {
    const v = attrs[sizeKey];
    size = Array.isArray(v) ? String(v[0]) : String(v);
  }
  const colorKey = Object.keys(attrs).find(
    (k) => k.toLowerCase() === 'color' || k.toLowerCase() === 'colour'
  );
  if (colorKey && attrs[colorKey] != null && attrs[colorKey] !== '') {
    const v = attrs[colorKey];
    color = Array.isArray(v) ? String(v[0]) : String(v);
  }
  return { size, color };
}

/** For order creation: get selectedAttributes from cart item (only field we persist on order). */
export function getSelectedAttributesFromCartItem(item: {
  selectedAttributes?: Record<string, unknown> | null;
}): Record<string, unknown> | undefined {
  const attrs = item.selectedAttributes && typeof item.selectedAttributes === 'object' ? item.selectedAttributes : undefined;
  if (!attrs || Object.keys(attrs).length === 0) return undefined;
  return JSON.parse(JSON.stringify(attrs));
}
