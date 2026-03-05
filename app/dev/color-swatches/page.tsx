'use client';

import ColorSwatch from '@/components/products/ColorSwatch';

/**
 * Sample page: how admin color attributes like "tricolor(yellow, white and rose gold)"
 * and "two tone(yellow and white gold)" are displayed as swatches.
 * Open /dev/color-swatches to see.
 */
const SAMPLES = [
  { label: 'Tricolor (yellow, white and rose gold)', value: 'tricolor(yellow, white and rose gold)' },
  { label: 'Two tone (yellow and white gold)', value: 'two tone(yellow and white gold)' },
];

export default function DevColorSwatchesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-xl font-bold text-gray-900">Color swatch samples</h1>
        <p className="text-sm text-gray-600">
          For values like &quot;tricolor(yellow, white and rose gold)&quot; or &quot;two tone(yellow and white gold)&quot;,
          the text inside parentheses is split by comma and &quot;and&quot;; each part is resolved to a color and
          shown as segments in one circle.
        </p>
        <ul className="space-y-4">
          {SAMPLES.map(({ label, value }) => (
            <li
              key={value}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <ColorSwatch color={value} size="lg" />
              <div>
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">Value: &quot;{value}&quot;</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500">
          Tricolor → 3 segments (yellow, white, rose gold). Two tone → 2 segments (yellow, white gold).
        </p>
      </div>
    </div>
  );
}
