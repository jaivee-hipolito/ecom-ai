'use client';

import { CategoryAttribute } from '@/types/category';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';

interface DynamicAttributesProps {
  attributes: CategoryAttribute[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  errors?: Record<string, string>;
}

export default function DynamicAttributes({
  attributes,
  values,
  onChange,
  errors,
}: DynamicAttributesProps) {
  if (!attributes || attributes.length === 0) {
    return null;
  }

  const renderField = (attr: CategoryAttribute) => {
    const value = values[attr.name] || '';
    const error = errors?.[attr.name];

    switch (attr.type) {
      case 'text':
        return (
          <Input
            key={attr.name}
            label={attr.label}
            name={attr.name}
            type="text"
            value={value}
            onChange={(e) => onChange(attr.name, e.target.value)}
            required={attr.required}
            placeholder={attr.placeholder}
            error={error}
          />
        );

      case 'number':
        return (
          <Input
            key={attr.name}
            label={attr.label}
            name={attr.name}
            type="number"
            value={value}
            onChange={(e) => onChange(attr.name, e.target.value)}
            required={attr.required}
            placeholder={attr.placeholder}
            min={attr.validation?.min}
            max={attr.validation?.max}
            error={error}
          />
        );

      case 'textarea':
        return (
          <Textarea
            key={attr.name}
            label={attr.label}
            name={attr.name}
            value={value}
            onChange={(e) => onChange(attr.name, e.target.value)}
            required={attr.required}
            placeholder={attr.placeholder}
            rows={4}
            error={error}
          />
        );

      case 'select':
        return (
          <Select
            key={attr.name}
            label={attr.label}
            name={attr.name}
            value={value}
            onChange={(e) => onChange(attr.name, e.target.value)}
            required={attr.required}
            options={[
              { value: '', label: `Select ${attr.label}` },
              ...(attr.options || []).map((option) => ({
                value: option,
                label: option,
              })),
            ]}
            error={error}
          />
        );

      case 'boolean':
        return (
          <div key={attr.name} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={attr.name}
              name={attr.name}
              checked={value === true || value === 'true'}
              onChange={(e) => onChange(attr.name, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={attr.name} className="text-sm font-medium text-gray-700">
              {attr.label}
              {attr.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'date':
        return (
          <Input
            key={attr.name}
            label={attr.label}
            name={attr.name}
            type="date"
            value={value}
            onChange={(e) => onChange(attr.name, e.target.value)}
            required={attr.required}
            error={error}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3 md:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
        Category-Specific Attributes
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        {attributes.map((attr) => renderField(attr))}
      </div>
    </div>
  );
}

