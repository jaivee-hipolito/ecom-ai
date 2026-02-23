'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { formatCurrencyForInput, parseCurrencyInput } from '@/utils/currency';

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  label?: string;
  error?: string;
  value?: string | number;
  onChange?: (value: string, numValue: number) => void;
  readOnly?: boolean;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, error, value = '', onChange, readOnly, name, className = '', ...props }, ref) => {
    const [focusedValue, setFocusedValue] = useState<string | null>(null);
    const isFocused = focusedValue !== null;
    const strVal = String(value ?? '').replace(/,/g, '');
    const num = parseCurrencyInput(strVal);

    const displayVal = readOnly
      ? (isNaN(num) ? '' : formatCurrencyForInput(num))
      : isFocused
        ? focusedValue
        : (strVal && !isNaN(num) ? formatCurrencyForInput(num) : strVal);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9.]/g, '');
      const parts = raw.split('.');
      const restricted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : (parts.length > 1 ? parts[0] + '.' + parts[1].slice(0, 2) : raw);
      setFocusedValue(restricted);
      const parsed = parseCurrencyInput(restricted);
      onChange?.(restricted, isNaN(parsed) ? 0 : parsed);
    };

    const handleFocus = () => setFocusedValue(strVal || '');
    const handleBlur = () => {
      const toUse = focusedValue ?? strVal;
      const parsed = parseCurrencyInput(toUse);
      setFocusedValue(null);
      if (toUse && !isNaN(parsed) && parsed >= 0) {
        onChange?.(parsed.toFixed(2), parsed);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium pointer-events-none">
            $
          </span>
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            name={name}
            value={displayVal}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            readOnly={readOnly}
            placeholder="0.00"
            className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400 ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
