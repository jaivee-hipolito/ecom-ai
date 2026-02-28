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

      case 'multiselect': {
        const selectedArr = Array.isArray(value) ? value : (value ? String(value).split(',').map((s: string) => s.trim()).filter(Boolean) : []);
        const options = attr.options || [];
        return (
          <div key={attr.name} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-sm font-medium text-gray-700">
                {attr.label}
                {attr.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {options.length > 0 && (
                <span className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => onChange(attr.name, [...options])}
                    className="text-blue-600 hover:text-blue-800 font-medium underline focus:outline-none"
                  >
                    Select all
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    type="button"
                    onClick={() => onChange(attr.name, [])}
                    className="text-gray-500 hover:text-gray-700 font-medium underline focus:outline-none"
                  >
                    Deselect all
                  </button>
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {options.map((option) => {
                const isChecked = selectedArr.includes(option);
                return (
                  <label key={option} className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...selectedArr, option]
                          : selectedArr.filter((x) => x !== option);
                        onChange(attr.name, next);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-900">{option}</span>
                  </label>
                );
              })}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );
      }

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

