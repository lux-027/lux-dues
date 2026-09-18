'use client';

import React, { useEffect, useRef, useState } from 'react';

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const WEEKDAYS = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

interface DatePickerProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function parseDate(value?: string) {
  if (!value) return undefined;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

function formatDisplay(value?: string) {
  const date = parseDate(value);
  if (!date) return '';
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'GG.AA.YYYY',
  required = false,
  className = '',
  id,
}) => {
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);
  const [viewDate, setViewDate] = useState(selected || new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) setViewDate(selected);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      window.addEventListener('keydown', handleKey);
    }
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = startOffset + daysInMonth;
  const weeks = Math.ceil(totalCells / 7);

  const days = Array.from({ length: weeks * 7 }, (_, i) => {
    const dayNumber = i - startOffset + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) return null;
    return dayNumber;
  });

  const handleSelect = (day: number) => {
    const next = new Date(year, month, day);
    const y = next.getFullYear();
    const m = pad(next.getMonth() + 1);
    const d = pad(next.getDate());
    onChange(`${y}-${m}-${d}`);
    setOpen(false);
  };

  const goToPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isSelected = (day: number) => {
    if (!selected) return false;
    return (
      selected.getFullYear() === year &&
      selected.getMonth() === month &&
      selected.getDate() === day
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <button
        type="button"
        id={id}
        onClick={() => setOpen((prev) => !prev)}
        className={`input-field w-full text-left inline-flex items-center justify-between ${open ? 'ring-2 ring-zinc-400' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={value ? 'text-zinc-900' : 'text-zinc-400'}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-zinc-200 p-4"
          role="dialog"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-zinc-900">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {WEEKDAYS.map((wd) => (
              <span key={wd} className="text-[10px] font-semibold text-zinc-500 uppercase">
                {wd}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) =>
              day ? (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={`
                    h-8 w-8 rounded-full text-xs font-medium transition-colors
                    ${
                      isSelected(day)
                        ? 'bg-zinc-900 text-white'
                        : 'text-zinc-700 hover:bg-zinc-100'
                    }
                  `}
                >
                  {day}
                </button>
              ) : (
                <div key={idx} className="h-8 w-8" />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
