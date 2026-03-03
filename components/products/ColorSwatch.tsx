'use client';

interface ColorSwatchProps {
  color: string;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

// Common color name to hex mapping (exact match)
const colorMap: Record<string, string> = {
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#6B7280',
  grey: '#6B7280',
  brown: '#92400E',
  navy: '#1E3A8A',
  beige: '#F5F5DC',
  gold: '#F59E0B',
  silver: '#C0C0C0',
  rose: '#E11D48',
  teal: '#0D9488',
  mint: '#6EE7B7',
  'light pink': '#FBCFE8',
  'hot pink': '#EC4899',
  'blue green': '#0D9488',
  'dusty pink': '#D4A5A5',
  blush: '#DEB5B5',
};

// Keywords that map to a base color (so "Light Pink", "Pink Blush" etc. show as pink)
const colorKeywords: Array<{ keyword: string; hex: string }> = [
  { keyword: 'pink', hex: '#EC4899' },
  { keyword: 'rose', hex: '#E11D48' },
  { keyword: 'green', hex: '#10B981' },
  { keyword: 'blue', hex: '#3B82F6' },
  { keyword: 'red', hex: '#EF4444' },
  { keyword: 'yellow', hex: '#F59E0B' },
  { keyword: 'orange', hex: '#F97316' },
  { keyword: 'purple', hex: '#8B5CF6' },
  { keyword: 'black', hex: '#000000' },
  { keyword: 'white', hex: '#FFFFFF' },
  { keyword: 'gray', hex: '#6B7280' },
  { keyword: 'grey', hex: '#6B7280' },
  { keyword: 'brown', hex: '#92400E' },
  { keyword: 'gold', hex: '#F59E0B' },
  { keyword: 'silver', hex: '#C0C0C0' },
  { keyword: 'teal', hex: '#0D9488' },
  { keyword: 'mint', hex: '#6EE7B7' },
  { keyword: 'navy', hex: '#1E3A8A' },
  { keyword: 'beige', hex: '#F5F5DC' },
];

// Function to convert color name/hex to hex
function getColorHex(color: string): string {
  const normalizedColor = color.toLowerCase().trim();
  
  if (normalizedColor.startsWith('#')) {
    return normalizedColor;
  }
  if (colorMap[normalizedColor]) {
    return colorMap[normalizedColor];
  }
  if (/^[0-9A-Fa-f]{6}$/.test(normalizedColor)) {
    return `#${normalizedColor}`;
  }
  // Match by keyword so "Light Pink", "Pink", "Hot Pink" all show pink (first match wins; order matters)
  for (const { keyword, hex } of colorKeywords) {
    if (normalizedColor.includes(keyword)) {
      return hex;
    }
  }
  // Fallback: hash to a color (can produce gray/blue-green for unknown names)
  let hash = 0;
  for (let i = 0; i < normalizedColor.length; i++) {
    hash = normalizedColor.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hex = ((hash >> 0) & 0x00ffffff).toString(16).toUpperCase();
  return `#${'00000'.substring(0, 6 - hex.length)}${hex}`;
}

export default function ColorSwatch({
  color,
  selected = false,
  onClick,
  size = 'md',
  disabled = false,
}: ColorSwatchProps) {
  const colorHex = getColorHex(color);
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${sizes[size]} rounded-full border-2 transition-all ${
        selected
          ? 'border-[#F9629F] ring-2 ring-[#F9629F]/30 ring-offset-2'
          : 'border-gray-300 hover:border-gray-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ backgroundColor: colorHex }}
      title={color}
      aria-label={`Color: ${color}`}
    >
      {colorHex === '#FFFFFF' && (
        <div className="w-full h-full rounded-full border border-gray-300" />
      )}
    </button>
  );
}

