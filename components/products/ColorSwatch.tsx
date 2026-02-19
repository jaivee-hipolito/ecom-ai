'use client';

interface ColorSwatchProps {
  color: string;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

// Common color name to hex mapping
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
};

// Function to convert color name/hex to hex
function getColorHex(color: string): string {
  const normalizedColor = color.toLowerCase().trim();
  
  // If it's already a hex color
  if (normalizedColor.startsWith('#')) {
    return normalizedColor;
  }
  
  // Check color map
  if (colorMap[normalizedColor]) {
    return colorMap[normalizedColor];
  }
  
  // Try to parse as hex without #
  if (/^[0-9A-Fa-f]{6}$/.test(normalizedColor)) {
    return `#${normalizedColor}`;
  }
  
  // Default fallback - try to generate a color from the string
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

