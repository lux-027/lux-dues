import React from 'react';
import { Input } from './Input';
import { formatPhoneNumber, normalizePhoneNumber } from '@/lib/phone';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'value'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  placeholder?: string;
  value: string;
  /** Emits the E.164-normalized phone number (e.g. +905551234567). */
  onChange: (value: string) => void;
  /** Optional callback for the formatted display value. */
  onDisplayChange?: (value: string) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label = 'Telefon',
  error,
  helperText = 'Örn: 555 123 45 67',
  fullWidth = true,
  placeholder = '555 123 45 67',
  value,
  onChange,
  onDisplayChange,
  className = '',
  ...props
}) => {
  const displayValue = typeof value === 'string' ? formatPhoneNumber(value) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatPhoneNumber(raw);
    const normalized = normalizePhoneNumber(raw);

    onChange(normalized);
    onDisplayChange?.(formatted);
  };

  return (
    <Input
      type="tel"
      label={label}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      fullWidth={fullWidth}
      className={className}
      value={displayValue}
      onChange={handleChange}
      maxLength={13}
      inputMode="tel"
      {...props}
    />
  );
};
