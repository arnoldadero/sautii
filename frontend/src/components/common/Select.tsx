import React from 'react';
import clsx from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({
  className,
  error,
  label,
  helperText,
  ...props
}) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <select
        {...props}
        className={clsx(
          'block w-full rounded-md shadow-sm sm:text-sm',
          error
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
          className
        )}
      />
      {(error || helperText) && (
        <p
          className={clsx(
            'mt-2 text-sm',
            error ? 'text-red-600' : 'text-gray-500'
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};
