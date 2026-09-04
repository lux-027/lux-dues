'use client';

import React, { useState, useEffect } from 'react';
import { Input } from './Input';

const formatCurrency = (value: string) => {
  if (!value) return '';
  // Only digits, commas and dots
  let raw = value.replace(/[^0-9,.]/g, '');

  // Determine the last separator (dot or comma) as the decimal separator
  const lastDot = raw.lastIndexOf('.');
  const lastComma = raw.lastIndexOf(',');
  let lastSep = -1;
  let sepChar = '';
  if (lastDot > lastComma) {
    lastSep = lastDot;
    sepChar = '.';
  } else if (lastComma > lastDot) {
    lastSep = lastComma;
    sepChar = ',';
  }

  let int = '';
  let dec = '';
  if (lastSep !== -1) {
    int = raw.substring(0, lastSep).replace(/[.,]/g, '');
    dec = raw.substring(lastSep + 1).replace(/[.,]/g, '').slice(0, 2);
  } else {
    int = raw.replace(/[.,]/g, '');
  }

  // Remove leading zeros, but keep at least one digit
  int = int.replace(/^0+/, '') || '0';

  // Add thousand separators (dots for Turkish locale)
  int = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return dec ? `${int},${dec}` : int;
};

const toNumeric = (value: string) => {
  if (!value) return '';
  let raw = value.replace(/[^0-9,.]/g, '');
  const lastDot = raw.lastIndexOf('.');
  const lastComma = raw.lastIndexOf(',');
  let lastSep = -1;

  if (lastDot > lastComma) {
    lastSep = lastDot;
  } else if (lastComma > lastDot) {
    lastSep = lastComma;
  }

  let int = '';
  let dec = '';
  if (lastSep !== -1) {
    int = raw.substring(0, lastSep).replace(/[.,]/g, '');
    dec = raw.substring(lastSep + 1).replace(/[.,]/g, '').slice(0, 2);
  } else {
    int = raw.replace(/[.,]/g, '');
  }

  int = int.replace(/^0+/, '') || '0';
  return dec ? `${int}.${dec}` : int;
};

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type' | 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  onCurrencyChange?: (currency: string) => void;
}

const CURRENCIES = [
  { code: 'TRY', symbol: '₺' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
];

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  error,
  helperText,
  fullWidth = true,
  value,
  onChange,
  currency: currencyProp = 'TRY',
  onCurrencyChange,
  className = '',
  ...props
}) => {
  const [display, setDisplay] = useState(formatCurrency(value));
  const [currency, setCurrency] = useState(currencyProp);

  useEffect(() => {
    setCurrency(currencyProp);
  }, [currencyProp]);

  useEffect(() => {
    setDisplay(formatCurrency(value));
  }, [value]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setCurrency(next);
    onCurrencyChange?.(next);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatCurrency(raw);
    setDisplay(formatted);
    onChange(toNumeric(raw));
  };

  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol || '₺';

  return (
    <Input
      type="text"
      inputMode="decimal"
      label={label}
      error={error}
      helperText={helperText}
      fullWidth={fullWidth}
      className={className}
      value={display}
      onChange={handleChange}
      rightElement={
        <select
          value={currency}
          onChange={handleCurrencyChange}
          className="bg-zinc-100 text-zinc-800 text-sm font-semibold rounded-lg border border-zinc-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-zinc-400 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol}
            </option>
          ))}
        </select>
      }
      {...props}
    />
  );
};
