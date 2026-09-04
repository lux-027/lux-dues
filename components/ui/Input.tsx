import React, { useId } from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = true,
  className = '',
  rightElement,
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={`input-field ${rightElement ? 'pr-14' : ''} ${error ? 'input-error' : ''}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 font-light">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-zinc-500 font-light">
          {helperText}
        </p>
      )}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  fullWidth = true,
  className = '',
  id,
  rows = 4,
  ...props
}) => {
  const generatedId = useId();
  const textareaId = id || generatedId;
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="input-label">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`input-field resize-none ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 font-light">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-zinc-500 font-light">
          {helperText}
        </p>
      )}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  fullWidth = true,
  className = '',
  id,
  options,
  ...props
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="input-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`input-field ${error ? 'input-error' : ''}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600 font-light">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-zinc-500 font-light">
          {helperText}
        </p>
      )}
    </div>
  );
};
