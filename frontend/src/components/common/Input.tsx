import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  fullWidth = false,
  ...props
}) => {
  const inputClasses = clsx(
    'block rounded-md shadow-sm border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm',
    error && 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500',
    fullWidth && 'w-full',
    className
  );

  const id = props.id || props.name;

  return (
    <div className={clsx('flex flex-col', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          className={inputClasses}
          aria-describedby={`${id}-error ${id}-description`}
          {...props}
        />
      </div>
      {error && (
        <p
          className="mt-1 text-sm text-red-600"
          id={`${id}-error`}
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          className="mt-1 text-sm text-gray-500"
          id={`${id}-description`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
