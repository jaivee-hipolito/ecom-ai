'use client';

import { CategoryAttribute } from '@/types/category';
import ColorSwatch from './ColorSwatch';

interface ProductAttributesProps {
  attributes: Record<string, any>;
  categoryAttributes?: CategoryAttribute[];
}

export default function ProductAttributes({
  attributes,
  categoryAttributes = [],
}: ProductAttributesProps) {
  if (!attributes || Object.keys(attributes).length === 0) {
    return null;
  }

  // Create a map of attribute definitions for quick lookup
  const attributeMap = new Map(
    categoryAttributes.map((attr) => [attr.name, attr])
  );

  // Helper function to format attribute value
  const formatValue = (key: string, value: any): React.ReactNode => {
    const attrDef = attributeMap.get(key);
    const label = attrDef?.label || key;

    // Handle color attributes with swatches
    if (
      (key.toLowerCase().includes('color') ||
        key.toLowerCase().includes('colour')) &&
      typeof value === 'string'
    ) {
      // If value is a single color
      if (!value.includes(',')) {
        return (
          <div className="flex items-center space-x-3">
            <ColorSwatch color={value} size="md" />
            <span className="text-sm text-gray-700 capitalize">{value}</span>
          </div>
        );
      }
      // If value is multiple colors (comma-separated)
      const colors = value.split(',').map((c: string) => c.trim());
      return (
        <div className="flex items-center space-x-3">
          <div className="flex -space-x-2">
            {colors.map((color, index) => (
              <ColorSwatch key={index} color={color} size="sm" />
            ))}
          </div>
          <span className="text-sm text-gray-700">{colors.join(', ')}</span>
        </div>
      );
    }

    // Handle boolean attributes
    if (typeof value === 'boolean') {
      return (
        <span className="text-sm text-gray-700">
          {value ? (
            <span className="text-green-600 font-medium">Yes</span>
          ) : (
            <span className="text-gray-400">No</span>
          )}
        </span>
      );
    }

    // Handle array values
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    // Default: display as string
    return (
      <span className="text-sm text-gray-700">
        {String(value)}
      </span>
    );
  };

  return (
    <div className="border-t border-gray-200 pt-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Product Specifications
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(attributes).map(([key, value]) => {
          const attrDef = attributeMap.get(key);
          const label = attrDef?.label || key.replace(/([A-Z])/g, ' $1').trim();

          return (
            <div key={key} className="flex flex-col">
              <dt className="text-sm font-medium text-gray-500 mb-1">
                {label}
              </dt>
              <dd className="text-sm text-gray-900">
                {formatValue(key, value)}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

