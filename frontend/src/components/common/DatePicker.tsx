import React from 'react';
import { Input } from './Input';

interface DatePickerProps {
  value: Date | null;
  onChange: (value: Date | null) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
  label,
}) => {
  const handleChange = (dateStr: string) => {
    if (!dateStr) {
      onChange(null);
      return;
    }
    const date = new Date(dateStr);
    onChange(date);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <Input
        type="date"
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${className}`}
      />
    </div>
  );
};
